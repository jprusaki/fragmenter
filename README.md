# fragmenter

A lightweight web design utility that simplifies splitting and wrapping text
into individual elements, making it easy to apply unique styles to single
characters, words, or lines of text for custom lettering.

It's fast, simple to use, and thoroughly tested. It has zero dependencies and is
framework agnostic.

## Installation

Choose the installation method for your package manager:

```bash
npm install fragmenter
# or
yarn add fragmenter
# or
pnpm add fragmenter
```

## Usage

Basic usage. See the [API documentation](#api) for more options.

```html
<div class="a">Hello</div>
<div class="b">Hello World!</div>
<div class="c">Hello!<br>How are you?</div>
```

```javascript
import { makeFragments } from 'fragmenter';

const a = document.querySelector('.a');
const b = document.querySelector('.b');
const c = document.querySelector('.c');

makeFragments(a, 'char'); // Splits into characters
makeFragments(b, 'word'); // Splits into words
makeFragments(c, 'line'); // Splits into lines
```

Result:

```html
<div class="a" aria-label="Hello">
  <span aria-hidden="true" data-char="H">H</span>
  <span aria-hidden="true" data-char="e">e</span>
  <span aria-hidden="true" data-char="l">l</span>
  <span aria-hidden="true" data-char="l">l</span>
  <span aria-hidden="true" data-char="o">o</span>
</div>

<div class="b" aria-label="Hello World!">
  <span aria-hidden="true" data-word="Hello">Hello</span>
  <span aria-hidden="true" data-word="World!">World!</span>
</div>

<div class="c" aria-label="Hello! How are you?">
  <span aria-hidden="true" data-line="Hello!">Hello!</span>
  <span aria-hidden="true" data-line="How are you?">How are you?</span>
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

/* a specific character */
[data-char="H"] {
    /* ... */
}
```

You can style elements beyond using data attributes. You can also use custom
functions or strings in the options object, as detailed in the API section.

## API

### `makeFragments(element, method, options)`

Splits text into characters, words, or lines, and wraps each segment in a new element.

**Parameters**:

- `element: (string | HTMLElement)`: **Required**. The element that you want to process. It can be a CSS selector or an HTML element.
- `method: (string)`: **Required**. Specifies how the text should be split. Possible values are:
  - `"char"`: Split into individual characters,
  - `"word"`: Split into words.
  - `"line"`: Split into lines.
- `options: (object)`: Optional. Lets you customize how the process works.

**Options**:

- `scope: (HTMLElement | Document)`: Limits the search for the `element` to descendants of this element. If not provided, the entire document is searched.
- `maxElements (number)`: The maximum number of elements to create. Limited for
  performance reasons. Defaults to `400` (limit per call).
- `addEllipsis (boolean)`: If the text is longer than `maxElements`, adds an ellipsis (…) at the end. Defaults to `false`.
- `ellipsisText: (string)`: The text to use for the ellipsis. Defaults to `"…"` (U+2026).
- `fragmentClass: (string | ((index: number, text: string) => string | undefined))`: The CSS class to add to each new element. It can be a simple class name (string) or a function. If it's a function, it receives the segment's index and text content as arguments, and should return a class name or `undefined` to not add any class. Defaults to `""`.

## Examples

More examples with options.

---

```javascript
makeFragments(a, "char", {
  fragmentClass(index, text) {
    return `char${index + 1}`;
  }
})
```

Result:

```html
<div class="a" aria-label="Hello">
  <span class="char1" aria-hidden="true" data-char="H">H</span>
  <span class="char2" aria-hidden="true" data-char="e">e</span>
  <span class="char3" aria-hidden="true" data-char="l">l</span>
  <span class="char4" aria-hidden="true" data-char="l">l</span>
  <span class="char5" aria-hidden="true" data-char="o">o</span>
</div>
```

---

```javascript
makeFragments(b, "word", {
  fragmentClass(index, text) {
    if(text === "Hello") {
      return "myClass";
    }

    if(text === "World!") {
      return "mySecondClass"
    }
  }
})
```

Result:

```html
<div class="b" aria-label="Hello World!">
  <span class="myClass" aria-hidden="true" data-word="Hello">Hello</span>
  <span class="mySecondClass" aria-hidden="true" data-word="World!">World!</span>
</div>
```

---

## Notes

- We call fragments the resulting `span` elements generated from the split text.
- `fragmenter` gives you maximum control over the text styles for custom
  lettering. Web browsers apply typographic features like kerning and ligatures
  to text within the same element. Splitting text into separate elements, as
  `fragmenter` does, disables these typographic features.
- Be mindful of performance. Splitting many elements can be computationally
  expensive, especially for large amounts of text. If you need to apply custom
  styles to a large text, you best choice is typography, not lettering.

## Contributing

1. Fork the repository.
2. Create a new branch (`git checkout -b my-new-feature`).
3. Make your changes.
4. Write tests for your changes.
5. Check your changes for typos (`yarn lint`).
6. Run tests (`yarn test`).
7. Submit a pull request [at Github's pull request page](https://github.com/jprusaki/fragmenter/pulls).

## License

This project is licensed under the [Apache License 2.0](https://www.apache.org/licenses/LICENSE-2.0).

## Acknowledgments

These projects were a great source of inspiration:

- [Lettering.js](http://github.com/davatron5000/Lettering.js)
- [letterify](https://github.com/dazld/letterify)
