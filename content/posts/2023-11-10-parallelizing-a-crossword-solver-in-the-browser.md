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

## The Solution

### How it works

### Parallelizing

## Next steps?

- Deploying the code
- Writting the whole UI in Rust/Wasm
- Think of other strategies for task parallelization
