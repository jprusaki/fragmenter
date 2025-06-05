import { makeFragments } from './index.js';

let el: HTMLDivElement;

beforeEach(() => {
	el = document.createElement('div');
	document.body.append(el);
});

afterEach(() => {
	el.remove();
});

describe('makeFragments', () => {
	it('should accept HTML elements', () => {
		const text = 'Hello';
		el.textContent = text;

		expect(() => makeFragments(el, 'word')).not.toThrow();
		expect(el.childElementCount).toBe(1);
	});

	it('should accept CSS selectors', () => {
		const text = 'Hello';
		el.textContent = text;

		expect(() => makeFragments('div', 'word')).not.toThrow();
	});

	it('should split text into character elements', () => {
		const text = 'Hello World';

		el.textContent = text;
		expect.assertions(text.length * 3 + 2);

		makeFragments(el, 'grapheme');
		expect(el.childElementCount).toBe(text.length);

		const spanList = el.querySelectorAll('span').entries();

		for (const [index, value] of spanList) {
			expect(value).toHaveAttribute('data-grapheme', text[index]);
			expect(value).toHaveAttribute('aria-hidden', 'true');
			expect(value).toHaveTextContent(new RegExp(`^${text[index]}$`), {
				normalizeWhitespace: false,
			});
		}

		expect(el).toHaveAttribute('aria-label', 'Hello World');
	});

	it('should correctly split text into grapheme clusters with multiple code points', () => {
		const text = '👨‍👩‍👧‍👦👩‍🦱ñç🇯🇵𝟘𝟙𝟚𝟛';

		el.textContent = text;

		makeFragments(el, 'grapheme');

		const fragments = el.querySelectorAll('[data-grapheme]');

		expect(el.childElementCount).toBe(9);
		expect(fragments.item(0).textContent).toBe('👨‍👩‍👧‍👦');
		expect(fragments.item(1).textContent).toBe('👩‍🦱');
		expect(fragments.item(2).textContent).toBe('ñ');
		expect(fragments.item(3).textContent).toBe('ç');
		expect(fragments.item(4).textContent).toBe('🇯🇵');
		expect(fragments.item(5).textContent).toBe('𝟘');
		expect(fragments.item(6).textContent).toBe('𝟙');
		expect(fragments.item(7).textContent).toBe('𝟚');
		expect(fragments.item(8).textContent).toBe('𝟛');

		expect(el).toHaveAttribute('aria-label', text);
	});

	it('should correctly segment text into words for non-space-separated locales', () => {
		// "I am a cat. My name is Tanuki."
		const text = '吾輩は猫である。名前はたぬき。';

		el.textContent = text;

		makeFragments(el, 'word');

		expect(el.childElementCount).toBe(10);
		expect(el).toHaveAttribute('aria-label', text);
	});

	it('should split text into word elements', () => {
		const text = 'Hello World';
		const segments = 3;

		el.textContent = text;

		makeFragments('div', 'word');

		expect(el.childElementCount).toBe(segments);

		const spanList = el.querySelectorAll('span');

		expect(spanList.item(0).textContent).toBe('Hello');
		expect(spanList.item(0)).toHaveAttribute('data-word', 'Hello');
		expect(spanList.item(1)).not.toHaveAttribute('data-word');
		expect(spanList.item(1).textContent).toBe(' ');
		expect(spanList.item(2).textContent).toBe('World');
		expect(spanList.item(2)).toHaveAttribute('data-word', 'World');

		expect(el).toHaveAttribute('aria-label', text);
	});

	it('should split text into line elements', () => {
		const text = 'Hello<br>World';
		el.innerHTML = text;
		const segments = text.split('<br>');

		expect.assertions(segments.length * 3 + 2);

		makeFragments('div', 'line');

		expect(el.childElementCount).toBe(2);

		const spanList = el.querySelectorAll('span').entries();

		for (const [index, value] of spanList) {
			expect(value).toHaveAttribute('data-line', segments[index]);
			expect(value).toHaveAttribute('aria-hidden', 'true');
			expect(value).toHaveTextContent(new RegExp(`^${segments[index]}$`));
		}

		expect(el).toHaveAttribute('aria-label', 'Hello World');
	});

	it('should split text into sentence elements', () => {
		const text = 'I am a cat. My name is Tanuki.';

		el.textContent = text;

		makeFragments(el, 'sentence');

		const first = el.children.item(0);
		const second = el.children.item(1);

		expect(el.childElementCount).toBe(2);
		expect(first?.textContent).toBe('I am a cat. ');
		expect(first).toHaveAttribute('data-sentence', 'I am a cat. ');
		expect(first).toHaveAttribute('aria-hidden', 'true');

		expect(second?.textContent).toBe('My name is Tanuki.');
		expect(second).toHaveAttribute('data-sentence', 'My name is Tanuki.');
		expect(second).toHaveAttribute('aria-hidden', 'true');

		expect(el).toHaveAttribute('aria-label', text);
	});

	it('should not modify elements without text content', () => {
		el.textContent = '';
		el.innerHTML = '';

		makeFragments('div', 'grapheme');

		expect(el.innerHTML).toBe('');
		expect(el.childElementCount).toBe(0);
		expect(el.attributes.length).toBe(0);
	});

	it('should limit the search scope', () => {
		el.textContent = 'Hello World';
		const scopedEl = document.createElement('div');
		scopedEl.textContent = 'how are you?';
		document.body.append(scopedEl);

		makeFragments('div', 'grapheme', {
			scope: el,
		});

		expect(scopedEl.childElementCount).toBe(0);
		scopedEl.remove();
	});

	it('should limit the number of elements', () => {
		el.textContent = 'Neque porro quisquam est qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit...';

		makeFragments('div', 'word', {
			maxElements: 1,
		});

		expect(el.childElementCount).toBe(1);
		const word = el.querySelector('span');
		expect(word).toHaveAttribute('data-word', 'Neque');
		expect(word).toHaveAttribute('aria-hidden', 'true');
	});

	it('should append an ellipsis element', () => {
		el.textContent = 'Neque porro quisquam est qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit...';
		const ellipsisChar = '…';

		makeFragments('div', 'word', {
			maxElements: 1,
			addEllipsis: true,
		});

		expect(el.childElementCount).toBe(2);

		const ellipsisEl = el.lastElementChild;

		expect(ellipsisEl?.attributes.length).toBe(2);
		expect(ellipsisEl).toHaveAttribute('aria-hidden', 'true');
		expect(ellipsisEl).toHaveAttribute('data-ellipsis', ellipsisChar);
		expect(ellipsisEl).toHaveTextContent(ellipsisChar);
	});

	it('should append a custom ellipsis element', () => {
		el.textContent = 'Neque porro quisquam est qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit...';
		const ellipsisChar = 'Read more...';

		makeFragments('div', 'word', {
			maxElements: 1,
			addEllipsis: true,
			ellipsisText: ellipsisChar,
		});

		expect(el.childElementCount).toBe(2);

		const ellipsisEl = el.lastElementChild;

		expect(ellipsisEl).toHaveAttribute('aria-hidden', 'true');
		expect(ellipsisEl).toHaveAttribute('data-ellipsis', ellipsisChar);
		expect(ellipsisEl).toHaveTextContent(ellipsisChar);
	});

	it('should set custom classes via string', () => {
		el.textContent = 'Hello';

		makeFragments('div', 'word', {
			fragmentClass: 'custom',
		});

		const span = el.querySelector('span');

		expect(span).toHaveClass('custom');
	});

	it('should set custom classes via function', () => {
		el.textContent = 'Hello World';

		makeFragments('div', 'word', {
			fragmentClass(_index, text) {
				if (text === 'Hello') {
					return 'colorOne';
				}

				if (text === 'World') {
					return 'colorTwo';
				}
			},
		});

		expect(el.querySelector('.colorOne')).toHaveTextContent('Hello');
		expect(el.querySelector('.colorTwo')).toHaveTextContent('World');
	});

	it('should not set custom classes if makeFragments returns undefined', () => {
		el.textContent = 'Hello World';

		makeFragments('div', 'word', {
			fragmentClass(_index, text) {
				if (text === 'Hello') {
					return 'colorOne';
				}
			},
		});

		expect(el.querySelector('.colorOne')).toHaveTextContent('Hello');
		expect(el.lastElementChild?.classList.length).toBe(0);
	});

	it('should update the segments when the text content changes', () => {
		el.textContent = 'Hello World';

		makeFragments('div', 'word', {
			fragmentClass(_index, text) {
				if (text === 'Hello') {
					return 'whiteText';
				}

				if (text === 'World') {
					return 'blueText';
				}
			},
		});

		expect(el.childElementCount).toBe(3);
		expect(el.querySelector('.whiteText')).toHaveTextContent('Hello');
		expect(el.querySelector('.blueText')).toHaveTextContent('World');

		el.textContent = 'Hello change';

		makeFragments('div', 'word', {
			fragmentClass(_index, text) {
				if (text === 'Hello') {
					return 'whiteText';
				}

				if (text === 'change') {
					return 'blueText';
				}
			},
		});

		expect(el.childElementCount).toBe(3);
		expect(el.querySelector('.whiteText')).toHaveTextContent('Hello');
		expect(el.querySelector('.blueText')).toHaveTextContent('change');
	});

	it('should preserve existing attributes', () => {
		const text = 'Hello';

		el.classList.add('myClass');
		el.setAttribute('data-test', 'value');
		el.setAttribute('aria-label', 'Test');
		el.textContent = text;

		makeFragments(el, 'word');

		expect(el).toHaveClass('myClass');
		expect(el).toHaveAttribute('data-test', 'value');
		expect(el).toHaveAttribute('aria-label', 'Test');
	});
});

describe('validation', () => {
	it('should accept locale values as Intl.Locale instances', () => {
		const korean = new Intl.Locale('ko', {
			script: 'Kore',
			region: 'KR',
			hourCycle: 'h23',
			calendar: 'gregory',
		});

		el.textContent = 'Hello';

		expect(() => makeFragments('div', 'grapheme', {
			locales: korean,
		})).not.toThrow();
	});

	it('should accept locale values as an array of Intl.Locale instances', () => {
		const japanese = new Intl.Locale('ja-Jpan-JP-u-ca-japanese-hc-h12');
		const korean = new Intl.Locale('ko', {
			script: 'Kore',
			region: 'KR',
			hourCycle: 'h23',
			calendar: 'gregory',
		});

		el.textContent = 'Hello';

		expect(() => makeFragments('div', 'grapheme', {
			locales: [
				japanese,
				korean
			],
		})).not.toThrow();
	});

	it('should accept locale values as an array of strings', () => {
		el.textContent = 'Hello';

		expect(() => makeFragments('div', 'grapheme', {
			locales: [
				'ja-JP',
				'ko-KR'
			],
		})).not.toThrow();
	});

	it('should throw when granularity is not set', () => {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		expect(() => makeFragments('div', undefined as any)).toThrow('Granularity can only be one of `grapheme`, `word`, `sentence` and `line`.');
	});

	it('should throw when granularity is an invalid type', () => {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		expect(() => makeFragments('div', 'chars' as any)).toThrow('Granularity can only be one of `grapheme`, `word`, `sentence` and `line`.');
	});

	it('should throw when element is an invalid type', () => {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		expect(() => makeFragments(0 as any, 'grapheme')).toThrow('Element must be of type string or HTMLElement.');
	});

	it('should throw when element is not set', () => {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		expect(() => makeFragments(null as any, 'grapheme')).toThrow('Element is required.');
	});

	it('should throw when maxElements is out of range', () => {
		expect(() => makeFragments('div', 'grapheme', {
			maxElements: 0,
		})).toThrow('maxElements value is out of range.');

		expect(() => makeFragments('div', 'grapheme', {
			maxElements: Infinity,
		})).toThrow('maxElements can only be an integer.');
	});

	it('should throw when maxElements is an invalid type', () => {
		expect(() => makeFragments('div', 'grapheme', {
			maxElements: 1.5,
		})).toThrow('maxElements can only be an integer.');

		expect(() => makeFragments('div', 'grapheme', {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			maxElements: null as any,
		})).toThrow('maxElements must be a number.');

		expect(() => makeFragments('div', 'grapheme', {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			maxElements: '' as any,
		})).toThrow('maxElements can only be an integer.');
	});

	it('should throw when scope is an invalid type', () => {
		expect(() => makeFragments(el, 'word', {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			scope: 'div' as any,
		})).toThrow('scope can only be an HTMLElement or Document.');
	});

	it('should throw when addEllipsis is an invalid type', () => {
		expect(() => makeFragments(el, 'word', {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			addEllipsis: 'div' as any,
		})).toThrow('addEllipsis can only be a boolean.');
	});

	it('should throw when ellipsisText is an invalid type', () => {
		expect(() => makeFragments(el, 'word', {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			ellipsisText: null as any,
		})).toThrow('ellipsisText can only be a string.');
	});

	it('should throw when fragmentClass is an invalid type', () => {
		expect(() => makeFragments(el, 'word', {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			fragmentClass: 1 as any,
		})).toThrow('fragmentClass can only be a string or a function.');

		el.textContent = 'Hello';

		expect(() => makeFragments(el, 'grapheme', {
			fragmentClass: () => {
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				return true as any;
			},
		})).toThrow('The return value of the fragmentClass function can only be a string or undefined.');
	});

	it('should throw when locale is an invalid type', () => {
		expect(() => makeFragments(el, 'grapheme', {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			locales: 0 as any,
		})).toThrow('locales can only be a string, or instance of Intl.Locale, or an array of each.');
	});
});
