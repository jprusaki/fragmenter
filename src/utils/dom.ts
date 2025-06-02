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

import { DEFAULTS } from '../config.js';
import { CSSClassOrClassFn, Granularity, Options } from '../index.js';
import { getClassName, LINE_SPLITTER, splitText } from './text.js';

export function createSpanElement(
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

export function replaceBrTags(element: HTMLElement) {
	const brList = [
		...element.getElementsByTagName('br'),
	];

	for (const br of brList) {
		br.replaceWith(document.createTextNode(LINE_SPLITTER));
	}
}

export function apply(element: HTMLElement, granularity: Granularity, options?: Options) {
	if (!element.textContent) {
		return;
	}

	const { maxElements, addEllipsis, ellipsisText, fragmentClass, locales } = {
		...DEFAULTS,
		...options,
	};

	if (granularity === 'line') {
		replaceBrTags(element);
	}

	const segments = splitText(element.textContent, granularity, locales);
	const limitedSegments = segments.slice(0, maxElements);
	const fragment = document.createDocumentFragment();

	limitedSegments.forEach(({ value, gAttr }, index) => {
		const span = createSpanElement(value, fragmentClass, index);

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
			? segments.map(s => s.value).join(' ')
			: element.textContent;
	}

	element.replaceChildren(fragment);
}
