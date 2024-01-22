+++
title = "Parallelizing a crossword composer in the browser"
[extra]
tags = [ "Rust", "Concurrency", "WebAssembly" ]
+++

## Introduction

Back in 2021, I was reading about [WebAssembly](https://webassembly.org/) and decided to try it out
for myself. I somehow ended up stumbling upon [Paul Butler](https://github.com/paulgb)'s [crossword
composer](https://github.com/paulgb/crossword-composer) solution, which consists of a solver written
in Rust, that compiles to Wasm and is called by a UI written in JavaScript. I got very intrigued
by it. It looked like a great starting point to play a little bit with WebAssembly. However, the
solution was already completed, what could I add to it?

Well, it turns out the crossword composing problem is NP-Complete and it takes a while to solve even
with relatively simple grids. You can test that in Butler's [deployed
solution](https://crossword.paulbutler.org/). I figured I could optimize it by applying concurrent
computing inside the browser, using another tool I was wanting to play around with -
[Web Workers](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API). That sounded like
an interesting project: applying concurrent computing inside the browser, using Wasm, to optimize
the solution of an NP-Complete problem.

## How it works

_Note: The functionality described below was entirely engineered by Paul, this is just my
interpretation of it._

### Solution flow

The grid is encoded in such a way that every cell has an identifier that maps to a letter. Words are
therefore mapped as an array of these identifiers, in such a way that words with intersections
between themselves will share same identifiers for their matching positions. The solver receives as
an input a list of these letter identifier arrays, and outputs a dictionary matching identifiers to
letters to fill the grid.

The diagram below tries to illustrate the entire flow.
![Test](/assets/solver-flow.jpg)
_Flow_

### The solver

The solver applies a backtracking approach to find words that fit all restrictions. It maps through
the list of words, choosing words from a given dictionary that fits the restrictions of length and
intersections. If no fitting word is found, it backtracks to the previous word in the list, and
changes it to another word from the dictionary. The process repeats until either all combination
possibilities are explored without success or the first solution is found.

Two optimizations

### Parallelizing

## Conclusion

For Portuguese-speaking readers, you can check out a published version of an article I wrote on this
project [here](https://sol.sbc.org.br/index.php/eradsp/article/view/21918).

## Next steps?

- Deploying the parallel solution
- Writting the whole UI in Rust/Wasm
- Thinking of other strategies for task parallelization
