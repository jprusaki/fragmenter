type FragmenterMethods = 'char' | 'word' | 'line'

type FragmentClass = string | ((index: number, text: string) => string | undefined);

interface FragmenterOptions {
	/**
	 * Limits the search for the element to descendants of this element. If not
	 * provided, the entire document is searched.
	 *
	 * @default document
	 */
	scope?: Element | Document,
	/**
	 * The maximum number of elements to create. Limited for performance reasons.
	 *
	 * @default 400
	 */
	maxElements?: number;
	/**
	 * If the text is longer than {@link FragmenterOptions.maxElements}, adds an
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
	fragmentClass?: FragmentClass;
}

const defaultOptions: Required<FragmenterOptions> = {
	scope: document,
	maxElements: 400,
	addEllipsis: false,
	ellipsisText: '…',
	fragmentClass: ''
};
const DEFAULT_MAX_ELEMENTS = 400;
const LINE_SPLITTER = 'dda8fc3819919fd096e9bd761d37dd10'; // MD5 hash of the string "LINE_SPLITTER".

/**
 * Splits `element.textContent` into characters, words, or lines and wraps each
 * segment in a new element.
 *
 * @param element The element that you want to process. It can be a CSS
 * selector or an HTML element.
 * @param method Specifies how the text should be split.
 * @param options Customize how the process works.
 */
export function makeFragments(
	element: string | HTMLElement, method: FragmenterMethods, options?: FragmenterOptions
): void {
	if (element === null || typeof element === 'undefined') {
		throw new TypeError('Element is not set.');
	}

	if (!isString(element) && !isHTMLElement(element)) {
		throw new TypeError('Element must be of type string or HTMLElement.');
	}

	if(!method) {
		throw new Error('Method is required.');
	}


	if (!isMethod(method)) {
		throw new TypeError('Invalid split method.');
	}

	if(options) {
		validateOptions(options);
	}

	const {
		scope,
	} = { ...defaultOptions, ...options };

	const elements = isString(element)
		? Array.from(scope.querySelectorAll(element))
		: [element];

	elements.forEach((element) => {
		if (isHTMLElement(element)) {
			apply(element, method, options);
		}
	});
}

function validateOptions(options: FragmenterOptions) {
	const {
		scope,
		maxElements,
		addEllipsis,
		ellipsisText,
		fragmentClass
	} = { ...defaultOptions, ...options };

	if (maxElements === null) {
		throw new TypeError('maxElements must be a number.');
	}

	if (!Number.isInteger(maxElements)) {
		throw new Error('maxElements can only be an integer.');
	}

	if (maxElements <= 0
		|| !isFinite(maxElements)
		|| maxElements > DEFAULT_MAX_ELEMENTS) {
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
}

function apply(element: HTMLElement, method: FragmenterMethods, options?: FragmenterOptions): void {
	if (!element.textContent) {
		return;
	}

	const { maxElements, addEllipsis, ellipsisText, fragmentClass } = {
		...defaultOptions,
		...options,
	};

	if (method === 'line') {
		const brList = Array.from(element.getElementsByTagName('br'));

		for (const br of brList) {
			br.replaceWith(document.createTextNode(LINE_SPLITTER));
		}
	}

	const segments = splitText(element.textContent, method);
	const limitedSegments = segments.slice(0, maxElements); // Limit segments

	const fragment = document.createDocumentFragment();
	limitedSegments.forEach((segment, index) => {
		fragment.appendChild(createSpanElement(segment, method, fragmentClass, index));
	});

	if (addEllipsis && limitedSegments.length < segments.length) {
		const ellipsisSpan = createSpanElement(ellipsisText, 'ellipsis');

		fragment.append(ellipsisSpan);
	}

	if (!element.hasAttribute('aria-label')) {
		element.ariaLabel = method === 'char'
			? element.textContent
			: segments.join(' ');
	}

	element.innerHTML = '';
	element.appendChild(fragment);
}

function splitText(text: string, method: FragmenterMethods): string[] {
	switch (method) {
		case 'char':
			return text.split('');
		case 'word':
			return text.split(' ');
		case 'line':
			return text.split(LINE_SPLITTER);
	}
}

function createSpanElement(
	text: string, method: FragmenterMethods | 'ellipsis', fragmentClass?: FragmentClass, index?: number,
): HTMLSpanElement {
	const span = document.createElement('span');
	span.textContent = text;
	span.ariaHidden = 'true';

	if (typeof index !== 'undefined') {
		const className = typeof fragmentClass === 'function'
			? fragmentClass(index, text)
			: fragmentClass;

		if (className) {
			span.classList.add(className);
		}
	}

	switch (method) {
		case 'char':
			span.dataset.char = text;
			break;

		case 'line':
			span.dataset.line = text;
			break;

		case 'word':
			span.dataset.word = text;
			break;

		case 'ellipsis':
			span.dataset.ellipsis = text;
	}

	return span;
}

function isString(element: unknown): element is string {
	return typeof element === 'string';
}

function isBoolean(value: unknown): value is boolean {
	return typeof value === 'boolean';
}

function isHTMLElement(element: unknown): element is HTMLElement {
	return element instanceof HTMLElement;
}

function isDocument(value: unknown): value is Document {
	return value instanceof Document;
}

function isMethod(value: unknown): value is FragmenterMethods {
	return value === 'char'
		|| value === 'word'
		|| value === 'line';
}

function isFragmentClass(value: unknown): value is FragmentClass {
	return isString(value) || typeof value === 'function';
}
