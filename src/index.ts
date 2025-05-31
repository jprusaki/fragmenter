/**
 * A lightweight web design utility that simplifies splitting and wrapping
 * text into individual elements for custom lettering.
 *
 * @packageDocumentation
 */

/**
 * fragmenter
 * https://github.com/jprusaki/fragmenter
 * @license Apache-2.0
 *
 * Copyright 2025 José Pedro Rusakiewicz Serna
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { DEFAULTS } from './config.js';
import { isGranularity, isHTMLElement, isNumber, isString, isUndefined } from './utils/typeGuards.js';
import { validateOptions } from './utils/validate.js';
/**
	 * The CSS class to add to each new element. It can be a simple class name
	 * (string) or a function. If it's a function, it receives the segment's
	 * index and text content as arguments, and should return a class name or
	 * `undefined` to not add any class.
	 *
	 * @defaultValue ""
	 * @public
	 */
export type CSSClassOrClassFn = string | ((index: number, text: string) => string | undefined)

/**
 * Specifies how to split the text.
 *
 * @public
 */
export type Granularity = 'grapheme' | 'word' | 'sentence' | 'line'

/**
 * Customize how the process works.
 *
 * @public
 */
export interface Options {
	/**
	 * Limits the search for the element to descendants of this element. If not
	 * provided, the entire document is searched.
	 *
	 * @defaultValue `document`
	 */
	scope?: HTMLElement | Document;
	/**
	 * The maximum number of elements to create. Limited for performance reasons.
	 *
	 * @defaultValue 400
	 */
	maxElements?: number;
	/**
	 * If the text is longer than {@link Options.maxElements}, adds an
	 * ellipsis (…) at the end.
	 *
	 * @defaultValue false
	 */
	addEllipsis?: boolean;
	/**
	 * The text to use for the ellipsis
	 *
	 * @defaultValue "…" (U+2026)
	 */
	ellipsisText?: string;
	/**
	 * The CSS class to add to each new element. It can be a simple class name
	 * (string) or a function. If it's a function, it receives the segment's
	 * index and text content as arguments, and should return a class name or
	 * `undefined` to not add any class.
	 *
	 * @defaultValue ""
	 */
	fragmentClass?: CSSClassOrClassFn;
	/**
	 * The locales to use to split the text. You can find more details
	 * at {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl#locales_argument | the Intl reference page}.
	 *
	 * @defaultValue `navigator.language`
	 */
	locales?: Intl.LocalesArgument;
}

/**
 * Internal representation of a text segment.
 */
interface Segment {
	/**
	 * The segment's text value.
	 */
	value: string;
	/**
	 * `true` if the resulting element should include
	 * a granularity attribute.
	 */
	gAttr: boolean;
}

const LINE_SPLITTER = 'dda8fc3819919fd096e9bd761d37dd10'; // MD5 hash of the string "LINE_SPLITTER".

/**
 * Splits `element.textContent` into graphemes, words, sentences, or lines,
 * and wraps each segment in a new element.
 *
 * @public
 * @param element - The element that you want to process. It can be a CSS
 * selector or an HTML element.
 * @param granularity - Specifies how to split the text.
 * @param options - Customize how the process works.
 */
export function makeFragments(
	element: string | HTMLElement, granularity: Granularity, options?: Options,
): void {
	if (element === null || typeof element === 'undefined') {
		throw new TypeError('Element is required.');
	}

	if (!isString(element) && !isHTMLElement(element)) {
		throw new TypeError('Element must be of type string or HTMLElement.');
	}

	if (!isGranularity(granularity)) {
		throw new TypeError('Granularity can only be one of `grapheme`, `word`, `sentence` and `line`.');
	}

	if (options) {
		validateOptions(options);
	}

	const {
		scope,
	} = { ...DEFAULTS, ...options };

	const elements = isString(element)
		? [...scope.querySelectorAll(element)]
		: [element];

	elements.forEach((element) => {
		if (isHTMLElement(element)) {
			apply(element, granularity, options);
		}
	});
}

function apply(element: HTMLElement, granularity: Granularity, options?: Options): void {
	if (!element.textContent) {
		return;
	}

	const { maxElements, addEllipsis, ellipsisText, fragmentClass, locales } = {
		...DEFAULTS,
		...options,
	};

	if (granularity === 'line') {
		const brList = [
			...element.getElementsByTagName('br'),
		];

		for (const br of brList) {
			br.replaceWith(document.createTextNode(LINE_SPLITTER));
		}
	}

	const segments = splitText(element.textContent, granularity, locales);
	const limitedSegments = segments.slice(0, maxElements);

	const fragment = document.createDocumentFragment();
	limitedSegments.forEach(({ value, gAttr }, index) => {
		const span = createSpanElement(value,  fragmentClass, index);

		if (gAttr) {
			span.dataset[granularity] = value;
		}

		fragment.append(span);
	});

	if (addEllipsis && limitedSegments.length < segments.length) {
		const ellipsisSpan = createSpanElement(ellipsisText);

		ellipsisSpan.dataset.ellipsis = ellipsisText;
		fragment.append(ellipsisSpan);
	}

	if (!element.hasAttribute('aria-label')) {
		element.ariaLabel = granularity === 'line'
			? segments.flatMap(s => s.value).join(' ')
			: element.textContent;
	}

	element.innerHTML = '';
	element.append(fragment);
}

function splitText(text: string, granularity: Granularity, locales: Intl.LocalesArgument): Segment[] {
	if (granularity === 'line') {
		const segments: Segment[] = text.split(LINE_SPLITTER).map((s: string) => {
			return {
				value: s,
				gAttr: true,
			};
		});

		return segments;
	}

	const segments: Segment[] = [
		...new Intl.Segmenter(locales, {
			granularity,
		}).segment(text),
	].map((s) => {
		return {
			value: s.segment,
			gAttr: granularity !== 'word' || !!s.isWordLike,
		};
	});

	return segments;
}

function createSpanElement(
	text: string, fragmentClass?: CSSClassOrClassFn, index?: number,
): HTMLSpanElement {
	const span = document.createElement('span');
	span.textContent = text;
	span.ariaHidden = 'true';

	if (fragmentClass) {
		const className = getClassName(fragmentClass, text, index);

		if (className) {
			span.classList.add(className);
		}
	}

	return span;
}

function getClassName(fragmentClass: CSSClassOrClassFn, text: string, index?: number): string | undefined {
	if (isString(fragmentClass)) {
		return fragmentClass;
	}

	if (isNumber(index)) {
		const res = fragmentClass(index, text);

		if (!isUndefined(res) && !isString(res)) {
			throw new TypeError('The return value of the fragmentClass function can only be a string or undefined.');
		}

		return res;
	}
}
