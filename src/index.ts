/*!
 * Copyright 2025 José Pedro Rusakiewicz Serna

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

type Granularity = 'grapheme' | 'word' | 'sentence' | 'line'

interface Segment {
	value: string;
	gAttr: boolean;
}

type CSSClassOrClassFn = string | ((index: number, text: string) => string | undefined)

interface Options {
	/**
	 * Limits the search for the element to descendants of this element. If not
	 * provided, the entire document is searched.
	 *
	 * @default document
	 */
	scope?: HTMLElement | Document;
	/**
	 * The maximum number of elements to create. Limited for performance reasons.
	 *
	 * @default 400
	 */
	maxElements?: number;
	/**
	 * If the text is longer than {@link Options.maxElements}, adds an
	 * ellipsis (…) at the end.
	 *
	 * @default false
	 */
	addEllipsis?: boolean;
	/**
	 * The text to use for the ellipsis
	 */
	ellipsisText?: string;
	/**
	 * The CSS class to add to each new element. It can be a simple class name
	 * (string) or a function. If it's a function, it receives the segment's
	 * index and text content as arguments, and should return a class name or
	 * `undefined` to not add any class.
	 *
	 * @default ""
	 */
	fragmentClass?: CSSClassOrClassFn;
	/**
	 * The locales to use to split the text.
	 */
	locales?: Intl.LocalesArgument;
}

const defaultOptions: Required<Options> = {
	scope: document,
	maxElements: 400,
	addEllipsis: false,
	ellipsisText: '…',
	fragmentClass: '',
	locales: navigator.language,
};
const LINE_SPLITTER = 'dda8fc3819919fd096e9bd761d37dd10'; // MD5 hash of the string "LINE_SPLITTER".

/**
 * Splits `element.textContent` into graphemes, words, sentences, or lines,
 * and wraps each segment in a new element.
 *
 * @param element The element that you want to process. It can be a CSS
 * selector or an HTML element.
 * @param granularity Specifies how to split the text.
 * @param options Customize how the process works.
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
	} = { ...defaultOptions, ...options };

	const elements = isString(element)
		? [...scope.querySelectorAll(element)]
		: [element];

	elements.forEach((element) => {
		if (isHTMLElement(element)) {
			apply(element, granularity, options);
		}
	});
}

function validateOptions(options: Options) {
	const {
		scope,
		maxElements,
		addEllipsis,
		ellipsisText,
		fragmentClass,
		locales,
	} = { ...defaultOptions, ...options };

	if (maxElements === null) {
		throw new TypeError('maxElements must be a number.');
	}

	if (!Number.isInteger(maxElements)) {
		throw new TypeError('maxElements can only be an integer.');
	}

	if (maxElements <= 0) {
		throw new RangeError('maxElements value is out of range.');
	}

	if (scope && !isHTMLElement(scope) && !isDocument(scope)) {
		throw new TypeError('scope can only be an HTMLElement or Document.');
	}

	if (!isBoolean(addEllipsis)) {
		throw new TypeError('addEllipsis can only be a boolean.');
	}

	if (!isString(ellipsisText)) {
		throw new TypeError('ellipsisText can only be a string.');
	}

	if (!isFragmentClass(fragmentClass)) {
		throw new TypeError('fragmentClass can only be a string or a function.');
	}

	if (!isLocale(locales)) {
		throw new TypeError('locales can only be a string, or instance of Intl.Locale, or an array of each.');
	}
}

function apply(element: HTMLElement, granularity: Granularity, options?: Options): void {
	if (!element.textContent) {
		return;
	}

	const { maxElements, addEllipsis, ellipsisText, fragmentClass, locales } = {
		...defaultOptions,
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
			gAttr: granularity === 'word' ? !!s.isWordLike : true,
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

function isString(value: unknown): value is string {
	return typeof value === 'string';
}

function isNumber(value: unknown): value is number {
	return typeof value === 'number';
}

function isBoolean(value: unknown): value is boolean {
	return typeof value === 'boolean';
}

function isHTMLElement(value: unknown): value is HTMLElement {
	return value instanceof HTMLElement;
}

function isDocument(value: unknown): value is Document {
	return value instanceof Document;
}

function isGranularity(value: unknown): value is Granularity {
	return value === 'grapheme'
		|| value === 'word'
		|| value === 'sentence'
		|| value === 'line';
}

function isFragmentClass(value: unknown): value is CSSClassOrClassFn {
	return isString(value) || typeof value === 'function';
}

function isUndefined(value: unknown): value is undefined {
	return typeof value === 'undefined';
}

function isLocale(value: unknown): value is Intl.LocalesArgument {
	const isValidLocale = (l: unknown) => typeof l === 'string' || l instanceof Intl.Locale;

	if (Array.isArray(value)) {
			return value.every(isValidLocale);
	}

	return isValidLocale(value);
}
