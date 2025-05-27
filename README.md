# fragmenter

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

This project offers both ESM and UMD module formats.

### ES module

This version supports module loaders (e.g., a bundler like Webpack, Rollup, or
Parcel, or a modern browser with ES module support).

Choose the installation method for your package manager:

```bash
npm install fragmenter
# or
yarn add fragmenter
# or
pnpm add fragmenter
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

  <script src="https://unpkg.com/fragmenter@:version/lib/fragmenter.umd.min.js"></script>
  <script>
    // fragmenter is now available in the global scope
    const { makeFragments } = fragmenter;
  </script>
</body>
```

The `:version` placeholder in the URL needs to be replaced with an actual
version number. The latest version is listed at the [NPM database][6].

You may also consider building the project locally and hosting it yourself.

## Usage

Basic usage. See the [API documentation](#api) and the [examples][7] for more
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

## API

### `makeFragments(element, granularity, options)`

Splits `element.textContent` into graphemes, words, sentences, or lines, and
wraps each segment in a new element.

**Parameters**:

- `element: (string | HTMLElement)`: **Required**. The element that you want to process. It can be a CSS selector or an HTML element.
- `granularity: (string)`: **Required**. Specifies how to split the text. Possible values are:
  - `"grapheme"`: Split into graphemes,
  - `"word"`: Split into words.
  - `"sentence"`: Split into sentences.
  - `"line"`: Split into lines by line break elements (`<br>`).
- `options: (object)`: Optional. Lets you customize how the process works.

**Options**:

- `scope: (HTMLElement | Document)`: Limits the search for the `element` to descendants of this element. If not provided, the entire document is searched.
- `maxElements (number)`: The maximum number of elements to create. Limited for performance reasons. Defaults to `400`.
- `addEllipsis (boolean)`: If the text is longer than `maxElements`, it adds an ellipsis (…) at the end. Defaults to `false`.
- `ellipsisText: (string)`: The text to use for the ellipsis. Defaults to `"…"` (U+2026).
- `fragmentClass: (string | ((index: number, text: string) => string | undefined))`: The CSS class to add to each new element. It can be a simple class name (string) or a function that receives the segment's index and text content as arguments, and should return a class name or `undefined` to not add any class. Defaults to `""`.
- `locales: (Intl.LocalesArgument)`: The locales to use to split the text. You can find more details [at the Intl MDN page][5]. Defaults to `navigator.language`.

## Examples

You can find additional examples in the [examples][7] folder.

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
6. Run tests (`yarn test`).
7. Submit a pull request [at the project's pull request page][1].

## License

This project is licensed under the Apache License 2.0 found in the [LICENSE][2]
file at the root directory of this source tree.

## Acknowledgments

These projects were a great source of inspiration:

- [Lettering.js][3]
- [letterify][4]

[1]: https://github.com/jprusaki/fragmenter/pulls
[2]: https://github.com/jprusaki/fragmenter/blob/main/LICENSE
[3]: http://github.com/davatron5000/Lettering.js
[4]: https://github.com/dazld/letterify
[5]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl#locales_argument
[6]: https://www.npmjs.com/package/fragmenter?activeTab=versions
[7]: https://github.com/jprusaki/fragmenter/tree/main/examples
