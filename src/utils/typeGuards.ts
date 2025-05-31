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

import { Granularity, CSSClassOrClassFn } from '../index.js';

export function isString(value: unknown): value is string {
	return typeof value === 'string';
}

export function isNumber(value: unknown): value is number {
	return typeof value === 'number';
}

export function isBoolean(value: unknown): value is boolean {
	return typeof value === 'boolean';
}

export function isHTMLElement(value: unknown): value is HTMLElement {
	return value instanceof HTMLElement;
}

export function isDocument(value: unknown): value is Document {
	return value instanceof Document;
}

export function isGranularity(value: unknown): value is Granularity {
	return value === 'grapheme'
		|| value === 'word'
		|| value === 'sentence'
		|| value === 'line';
}

export function isFragmentClass(value: unknown): value is CSSClassOrClassFn {
	return isString(value) || typeof value === 'function';
}

export function isUndefined(value: unknown): value is undefined {
	return typeof value === 'undefined';
}

export function isLocale(value: unknown): value is Intl.LocalesArgument {
	const isValidLocale = (l: unknown) => typeof l === 'string' || l instanceof Intl.Locale;

	if (Array.isArray(value)) {
			return value.every(isValidLocale);
	}

	return isValidLocale(value);
}
