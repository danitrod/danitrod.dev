# danitrod.dev

This is the source code of my personal website. It is backed by the
[Zola](https://github.com/getzola/zola) static site generator and I write my posts with markdown.
For styling I use [Tailwind](https://tailwindcss.com/) :)

## Running locally

### Pre-reqs

1. [Install Zola](https://www.getzola.org/documentation/getting-started/installation/)
2. [Install Tailwind](https://tailwindcss.com/docs/installation) (only if you need to change global CSS)

### Steps

Run `zola serve` in one terminal, and `npx tailwindcss -i css/main.css -o static/css/main.css -w` in
another in case you need to change the global CSS. Page will load at http://localhost:1111.
