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
import { Options } from '../index.js';
import { isBoolean, isDocument, isFragmentClass, isHTMLElement, isLocale, isString } from './typeGuards.js';

export function validateOptions(options: Options) {
	const {
		scope,
		maxElements,
		addEllipsis,
		ellipsisText,
		fragmentClass,
		locales,
	} = { ...DEFAULTS, ...options };

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
