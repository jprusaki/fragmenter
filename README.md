# Fragmenter

A lightweight web design utility that simplifies splitting and wrapping text
into individual elements, making it easy to apply unique styles for custom
lettering.

It supports splitting text by graphemes, words, sentences, and lines.

It is fast, simple to use, and thoroughly tested. It has zero dependencies and is
framework agnostic.

As of version 2.0.0, it supports grapheme clusters with multiple code points and
locales that do not use spaces to separate words (e.g., Japanese). It includes
emoji sequences (like `👩‍🦱`) and combining diacritical characters (such as
those in `ç` and `é`) within the same element.

## Installation

This project offers ESM and UMD module formats.

### ES module

This version supports module loaders (e.g., a bundler like Webpack, Rollup, or
Parcel, or a modern browser with ES module support).

Choose the installation method for your package manager. Fragmenter is published
at the [npmjs.com][7] registry:

```bash
npm install fragmenter
# or
yarn add fragmenter
# or
pnpm add fragmenter
# or some other package manager
```

Importing in your code:

```javascript
import { makeFragments } from 'fragmenter';

// Use fragmenter...
```

### UMD module

This version supports environments that do not require module loaders or a build
step.

It can be linked via UNPKG or jsDelivr like this:

```html
<body>
  <!-- Page content -->

  <script src="https://unpkg.com/fragmenter@:version/dist/fragmenter.umd.min.js"></script>
  <script>
    // fragmenter is now available in the global scope
    const { makeFragments } = fragmenter;
  </script>
</body>
```

The `:version` placeholder in the URL needs to be replaced with an actual
version number. The latest version is listed at the [NPM registry][5].

You may also consider building the project locally and hosting it yourself.

## Usage

Basic usage. See the [API Documentation](#api-documentation) and the [Examples][6] for more
options.

```html
<div class="a">Hello</div>
<div class="b">Hello World!</div>
<div class="c">Hello! How are you?</div>
```

```javascript
import { makeFragments } from 'fragmenter';

makeFragments('.a', 'grapheme'); // Splits into graphemes
makeFragments('.b', 'word'); // Splits into words
makeFragments('.c', 'sentence'); // Splits into sentences
```

Result:

```html
<div class="a" aria-label="Hello">
  <span aria-hidden="true" data-grapheme="H">H</span>
  <span aria-hidden="true" data-grapheme="e">e</span>
  <span aria-hidden="true" data-grapheme="l">l</span>
  <span aria-hidden="true" data-grapheme="l">l</span>
  <span aria-hidden="true" data-grapheme="o">o</span>
</div>

<div class="b" aria-label="Hello World!">
  <span aria-hidden="true" data-word="Hello">Hello</span>
  <span aria-hidden="true"> </span>
  <span aria-hidden="true" data-word="World">World</span>
  <span aria-hidden="true">!</span>
</div>

<div class="c" aria-label="Hello! How are you?">
  <span aria-hidden="true" data-sentence="Hello! ">Hello! </span>
  <span aria-hidden="true" data-sentence="How are you?">How are you?</span>
</div>
```

ARIA attributes are automatically added with the original text content to
provide accessibility information to assistive technologies. All original
attributes are preserved, including ARIA related ones.

Each element can now be targeted with content-aware selectors like this:

```css
/* Target all word elements */
[data-word] {
   /* ... */
}

/* a specific word */
[data-word="Hello"] {
    /* ... */
}

/* a specific grapheme */
[data-grapheme="H"] {
    /* ... */
}
```

You can style elements beyond using data attributes. You can also use custom
functions or strings in the options object, as detailed in the API section.

## API Documentation

Comprehensive API documentation can be found at the `docs` folder:

- **[API Reference][9]:** `docs/pages/index.md`
- **[Package][10]:** `docs/fragmenter/index.md`

An API summary can be found at the report file:

- **[API Report File][11]:** `etc/fragmenter.api.md`

## Examples

You can find additional examples in the [examples][6] folder.

## Notes

- We call fragments the resulting `span` elements generated from the split text.
- Splitting text into separate dom elements disables standard typographic
  features like kerning and ligatures.
- Be mindful of performance. Splitting many elements can be computationally
  expensive, especially for large amounts of text. If you need to apply custom
  styles to a large text, your best choice is type, not lettering.
- `fragmenter` works well with modern browsers, but if you need compatibility
  with older ones consider using polyfills for `Intl.Segmenter` and other
  features that might need it.

## Contributing

1. Fork the repository.
2. Create a new branch (`git checkout -b my-new-feature`).
3. Make your changes.
4. Write tests for your changes.
5. Check code style issues (`yarn lint`).
6. Run tests and check coverage (`yarn coverage`).
7. Submit a pull request [at the project's pull request page][1].

## License

This project's source code is licensed under the Apache License 2.0 found in the
[LICENSE][2] file at the root directory of this source tree.

This project's documentation is licensed under the [Creative Commons Attribution
4.0 International License][8].

## Acknowledgments

These projects were a great source of inspiration:

- [Lettering.js][3]
- [letterify][4]

[1]: https://github.com/jprusaki/fragmenter/pulls
[2]: https://github.com/jprusaki/fragmenter/blob/main/LICENSE
[3]: http://github.com/davatron5000/Lettering.js
[4]: https://github.com/dazld/letterify
[5]: https://www.npmjs.com/package/fragmenter?activeTab=versions
[6]: https://github.com/jprusaki/fragmenter/tree/main/examples
[7]: https://www.npmjs.com/
[8]: http://creativecommons.org/licenses/by/4.0/
[9]: https://github.com/jprusaki/fragmenter/blob/main/docs/pages/index.md
[10]: https://github.com/jprusaki/fragmenter/blob/main/docs/pages/fragmenter.md
[11]: https://github.com/jprusaki/fragmenter/blob/main/etc/fragmenter.api.md
