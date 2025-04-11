+++
title = "DLXs, DLQs, retrying and failed messages in RabbitMQ"
[extra]
tags = [ "Queues", "Async Processing", "Microservices", "RabbitMQ" ]
image_name = "queues-social.jpg"
description = "A guide to using RabbitMQ's dead-letter exchanges and queues to retry and persistently store failed messages."
+++

## Introduction

In an event-driven architecture, it is possible at some point you will have an event that can perhaps
not be processed at the time it is emitted, but it can be successfully done at some later point in
time.

For example, let's say that you have an integration with an external service, and whenever a new
user registers to your application you need to send an HTTP request to this external service. This
external service often stays down for maintenance on Monday mornings, and if you have users registered
in this period and try to send HTTP requests to it, they will fail as the service will be down.
You can continue the user registration, but still need to send the HTTP request when the external service
is available again. This is where retries can come in handy. In this post I will focus on an approach
specific for RabbitMQ users.

## RabbitMQ Dead-letter Headers

You can control the flow of rejected messages in RabbitMQ through headers, which can be defined either
at the queue level or per message. They are namely the `x-dead-letter-exchange` and the
`x-dead-letter-routing-key` headers, which basically state that messages with it that are rejected
will be published to that exchange, with that routing key.

So if you declare, for example, a queue `main_queue`, with the following headers:

```json
{
  "x-dead-letter-exchange": "dlx.direct",
  "x-dead-letter-routing-key": "main_queue.retry"
}
```

When a message from `main_queue` is rejected (or nacked) with requeue=false, the same message is
going to be routed to the `dlx.direct` exchange, with the `main_queue.retry` routing key.

You can see more information about how these work on [RabbitMQ's docs](https://www.rabbitmq.com/docs/dlx).

## Using DLX for retries

Now, to use these headers to our advantage, we can create queues that will be used for retries.
There is yet a third header that will be useful for us, the `x-message-ttl` header, to which
we can set an amount of time in milliseconds after which the messages will be dropped from the queue.
Note that this header can also be set either at the queue level or per message.

So, if we create our `main_queue` with the headers above, we can then create a `main_queue_retry`
queue, and add these headers to it:

```json
{
  "x-message-ttl": 60000,
  "x-dead-letter-exchange": "amq.topic",
  "x-dead-letter-routing-key": "main_queue.retry"
}
```

With them, we are stating that every message in this queue will expire after one minute, and be
routed to the `amq.topic` exchange with the `main_queue.retry` routing key.

Now, we can bind our `main_queue` to the `amq.topic` exchange with the `main_queue.retry` routing key,
bind our `main_queue_retry` to the `dlx.topic` exchange with the `main_queue.retry` routing key, and
we have retries setup. Every message rejected from the main queue will go to the retry queue, stay
there for one minute, and then be routed back to the main queue for reprocessing. Please note that
as it is, this may cause an infinite loop of reprocessing if the messages keep failing to be processed!
The next step is to add a condition for stopping, in case we reach a maximum number of retries.

## The x-death header

Every time a message is sent to another queue using the dead-letter headers, RabbitMQ adds or
updates the `x-death` header in the message, which includes, among other data, a counter
for the number of times the message has "died". This is exactly what we should use to stay aware of how many
times we are retrying. In our application, we can define a maximum number of retries that is
acceptable for us depending on the use case, and after x-death's counter reaches that number, we
can simply acknowledge the message so it doesn't get routed to the retry queue anymore.

## Storing failed messages

After the maximum number of retries is reached, it is a good practice to have even a third queue,
where the messages that really failed after all retries can stay stored, and later be analyzed if
needed. This is technically the real dead-letter queue (DLQ), or failed queue, and messages in there
we can consider in fact "dead". To declare the final DLQ, we don't need any headers, as the messages
in it shouldn't expire, and shouldn't route back to any other queue.

Since in our example we are already using the `x-dead-letter-exchange` header for retries and reprocessing,
we can't add another one for the failed queue. In this case, we will need to explicitly publish the
_really_ failed messages to the final DLQ.

## Conclusion

With this approach, we can add some robustness to our event-driven system and allow for retrying
the processing of messages that can possibly fail, even storing them if they fail too many times in
order to not lose any data.

Below is a simple representation of how this flow happens, with two publishers publishing to
two different routing keys bound to a main queue, which on error sends the message over to a retry queue,
which in turn sends it back to the main queue under a new routing key. After sufficient fails, the
message is stored in a final DLQ.

![Queue flow](/assets/queues.svg)

## References

- [RabbitMQ docs: DLX](https://www.rabbitmq.com/docs/dlx)
- [RabbitMQ docs: per queue TTL](https://www.rabbitmq.com/docs/ttl#per-queue-message-ttl)
