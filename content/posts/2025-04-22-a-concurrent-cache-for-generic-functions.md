+++
title = "A concurrent cache for generic functions"
[extra]
tags = [ "Go", "Concurrency", "Caching" ]
description = "A concurrent cache function in Go, using channels and goroutines."
+++

## Introduction

I once developed a business rules engine system to automate decisions
based on data and conditions. The idea was to write rule conditions as plain text expressions with
the [Expr library](https://github.com/expr-lang/expr), and schedule rules to execute at intervals.
Each rule also had an action ID, which would define what to do if the condition was met. We defined
custom functions with more advanced functionality to make use of them in the condition expressions.

To give a simplified example, a rule with this condition would only be satisfied if the given
request was created 48 or more hours ago:

```go
hoursSince(getRequestByID(event.Data.request_id).CreatedDate) >= 48
```

- `hoursSince` is a custom function that returns the number of hours since the given `time.Time`
- `getRequestByID` is a custom function that fetches a request in the database by its ID
- `event` is what is sent to the rule engine at processing time, containing the request ID

Think of the custom function as this interface:

```go
type Function interface {
	Key() string
	Value(args ...any) (any, error)
}
```

The `Key` method returns a string that identifies the function (e.g. `hoursSince`), and the `Value`
method does any computation needed to return the result of the function. An arbitrary number of
arguments can be received.

## The Problem

With thousands of incoming requests, triggering custom functions that would do
complex processing, database calls, and even calls to other services, rules were taking seconds to
finish. The system started to get overloaded, and database calls started to slow down a lot. This
began to affect other parts of the system relying on the database.

Given the static and repeatable nature of the requests that were coming in, we decided to start
caching the results of some of these more complex functions to reuse across requests. This way,
the complex part of the function would only be executed once, and the result would be reused by
all other requests that needed it.

## Caching

The first approach was pretty straightforward: adding a map to the function where we could store the
results with a key that could be resolved given the arguments passed. In that way, if the function
is called again with the same arguments, we simply look up the result in the map and return it. It
can be achieved with something like this:

```go
func NewCache(fn Function) Function {
	return &CacheFunction{
		fn:    fn,
		cache: map[string]any{},
	}
}

type CacheFunction struct {
	fn    Function
	cache map[string]any
}

func (f *CacheFunction) Key() string {
	return f.fn.Key()
}

func (f *CacheFunction) Value(args ...any) (any, error) {
	cacheKey := f.createCacheKey(args...)

	cached, hasCache := f.cache[cacheKey]
	if hasCache {
		return cached, nil
	}

	result, err := f.fn.Value(args...)
	if err != nil {
		return nil, err
	}

	f.cache[cacheKey] = result
	return result, nil
}

func (f *CacheFunction) createCacheKey(args ...any) string {
	cacheKey := f.Key()

	for i := 0; i < len(args); i++ {
		cacheKey = fmt.Sprintf("%s:%v", cacheKey, args[i])
	}

	return cacheKey
}
```

While that works, and already speeds up the responses significantly, there are a few problems with
this approach.

The first and maybe most obvious one, that was easily found with a little testing: data
race on the map. As we have multiple threads receiving requests, and the same cache function being
reused, we might simultaneously read from and write to the same map, which causes Go to panic
at runtime. This is relatively easy to fix in Go, we could simply use a Mutex or a `sync.Map` instead.

However, there was a second problem too, that was: if two requests come simultaneously, and no cached
result is available yet, the cache function would still execute the internal function two times, as
it would take some time to process and store a result in the map. This was especially
relevant to the use case, because the rules engine system was being used to process batches of
thousands of requests at times. If many tried to run the same function at the same time, we'd end up
just processing the internal function many times anyway, not making use of the cache.

## Handling Concurrent Calls

To fix this last problem, a solution is to make the cache function have knowledge of what is
already being processed. If there are more requests coming in for the same function, while it is
being processed, we simply wait for the result instead of processing it again. We can make use of
Go channels for this. We just have to be careful not to enter a
deadlock situation here, where multiple threads are waiting for each other to yield a result. Also,
we need to ensure the initial processing function is aware of the number of waiters,
so it sends the result to all of them.

This is the implementation of the above:

```go
const waitersCacheKeySuffix = ":waiters"

func NewCache(fn Function) Function {
	return &CacheFunction{
		fn:    fn,
		cache: sync.Map{},
	}
}

type CacheFunction struct {
	fn    Function
	cache sync.Map
	mu    sync.Mutex
}

type CacheResult struct {
	hasResult bool
	isRunning bool
	result    any
	ch        chan any
}

func (f *CacheFunction) Key() string {
	return f.fn.Key()
}

func (f *CacheFunction) Value(args ...any) (any, error) {
	cacheKey := f.createCacheKey(args...)

	f.mu.Lock() // Critical section until "isRunning" info is saved
	cached, hasCache := f.cache.Load(cacheKey)
	if hasCache {
		f.mu.Unlock() // As this thread will be a waiter or instant result, safe to unlock
		cachedResult, ok := cached.(CacheResult)
		if !ok {
			return nil, errors.New("could not parse cached result")
		}

		if cachedResult.hasResult {
			return cachedResult.result, nil
		}
		if cachedResult.isRunning {
			f.addWaiter(cacheKey)
			result := <-cachedResult.ch
			return result, nil
		}
		return nil, errors.New("invalid cache value found")
	}

	ch := make(chan any)
	cacheResult := CacheResult{
		isRunning: true,
		ch:        ch,
	}
	f.cache.Store(cacheKey, cacheResult)
	f.mu.Unlock() // Critical section safely ends here, as other callers will receive "isRunning"

	result, err := f.fn.Value(args...)
	if err != nil {
		return nil, err
	}

	waiters := f.getWaiters(cacheKey)

	f.mu.Lock() // Second critical section: no additional waiters can be added since the last read, and until cached result is stored
	for i := 0; i < waiters; i++ {
		ch <- result
	}
	close(ch)

	cacheResult = CacheResult{
		hasResult: true,
		result:    result,
	}
	f.cache.Store(cacheKey, cacheResult)
	f.mu.Unlock() // Final unlock

	return result, nil
}

func (f *CacheFunction) createCacheKey(args ...any) string {
	cacheKey := f.Key()

	for i := 0; i < len(args); i++ {
		cacheKey = fmt.Sprintf("%s:%v", cacheKey, args[i])
	}

	return cacheKey
}

func (f *CacheFunction) addWaiter(cacheKey string) {
	f.mu.Lock()
	defer f.mu.Unlock()

	waiters := 0
	cachedWaiters, found := f.cache.Load(cacheKey + waitersCacheKeySuffix)
	if found {
		parsed, ok := cachedWaiters.(int)
		if ok {
			waiters = parsed
		}
	}
	f.cache.Store(cacheKey+waitersCacheKeySuffix, waiters+1)
}

func (f *CacheFunction) getWaiters(cacheKey string) int {
	waiters := 0
	cachedWaiters, found := f.cache.Load(cacheKey + waitersCacheKeySuffix)
	if found {
		parsedWaiters, ok := cachedWaiters.(int)
		if ok {
			waiters = parsedWaiters
		}
	}

	return waiters
}
```

We now have a more robust cache function that is able to handle multiple simultaneous requests for
the same function, processing only once per set of parameters.

## Testing

To make sure everything works as expected, let's approach testing it out. The test below is a solid
attempt to test the concurrent reliability of the cache function. It tries to run the same function
three times, increasing a counter, and we expect the counter to be increased only once, proving that
the other two used the cached result.

```go
t.Run("Should only process one function, in case two attempt to run concurrently", func(t *testing.T) {
    counter := 0
    fn := func(args ...any) any {
        counter += 1
        time.Sleep(time.Second)
        return counter
    }

    cache := function.NewCache(entity.NewMockFunction("fn", fn))

    ch := make(chan int)

    concFn := func() {
        val, _ := cache.Value()
        parsed, ok := val.(int)
        if ok {
            ch <- parsed
        } else {
            ch <- 0
        }
    }

    go concFn()
    go concFn()
    go concFn()

    assert.Equal(t, 1, <-ch)
    assert.Equal(t, 1, <-ch)
    assert.Equal(t, 1, <-ch)
})
```

## Caveats

The final function is robust and reliable, but still far from optimal. My main concern with it is that
storing in memory is not scalable. For a single multi-threaded application it may be fine, but if
the application reinitializes, we lose what's in the cache. On the other hand, if we don't clean up
the cache from time to time, we risk exhausting the application's memory. If we are
scaling the application horizontally, other instances of it won't be aware of each other's caches.

A more scalable solution in this case might be to use a distributed lock ([Redis](https://redis.io/docs/latest/develop/use/patterns/distributed-locks/) seems to be a good option). But that's a story for another day.
