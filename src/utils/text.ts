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

import { CSSClassOrClassFn, Granularity } from '../index.js';
import { isNumber, isString, isUndefined } from './typeGuards.js';

/**
 * Internal representation of a text segment.
 */
export interface Segment {
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

export const LINE_SPLITTER = 'dda8fc3819919fd096e9bd761d37dd10'; // MD5 hash of the string "LINE_SPLITTER".

export function getClassName(fragmentClass: CSSClassOrClassFn, text: string, index?: number): string | undefined {
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

export function splitText(text: string, granularity: Granularity, locales: Intl.LocalesArgument): Segment[] {
	if (granularity === 'line') {
		return text.split(LINE_SPLITTER).map((s) => {
			return {
				value: s,
				gAttr: true,
			};
		});
	}

	return [
		...new Intl.Segmenter(locales, { granularity }).segment(text),
	].map((s) => {
		return {
			value: s.segment,
			gAttr: granularity !== 'word' || !!s.isWordLike,
		};
	});
}
