import { makeFragments } from './';

let el : HTMLDivElement

beforeEach(() => {
	el = document.createElement('div')
	document.body.appendChild(el);
})

afterEach(() => {
	el.remove();
})

describe('lettering function', () => {
	it('should accept HTML elements', () => {
		const text = 'Hello';
		el.textContent = text

		expect(() => makeFragments(el, 'word')).not.toThrow()
		expect(el.childElementCount).toBe(1);
	});

	it('should accept CSS selectors', () => {
		const text = 'Hello';
		el.textContent = text

		expect(() => makeFragments('div', 'word')).not.toThrow()
		expect(el)
	});

  it('should split text into character elements', () => {
		const text = 'Hello World';

		el.textContent = text;
		expect.assertions(text.length * 3 + 2)

    makeFragments(el, 'char');
		expect(el.childElementCount).toBe(text.length)

		const spanList = el.querySelectorAll('span').entries()

		for (const [index, value] of spanList) {
			expect(value).toHaveAttribute('data-char', text[index])
			expect(value).toHaveAttribute('aria-hidden', 'true')
			expect(value).toHaveTextContent(new RegExp(`^${text[index]}$`) , {
				normalizeWhitespace: false
			})
		}

    expect(el).toHaveAttribute('aria-label', 'Hello World')
  });

  it('should split text into word elements', () => {
		const text = 'Hello World'
		const segments = text.split(' ')

		expect.assertions(segments.length * 3 + 2)

		el.textContent = text;

    makeFragments('div', 'word');
		expect(el.childElementCount).toBe(segments.length)

		const spanList = el.querySelectorAll('span').entries()

		for (const [index, value] of spanList) {
			expect(value).toHaveAttribute('data-word', segments[index])
			expect(value).toHaveAttribute('aria-hidden', 'true')
			expect(value).toHaveTextContent(new RegExp(`^${segments[index]}$`))
		}

    expect(el).toHaveAttribute('aria-label', 'Hello World')
  });

  it('should split text into line elements', () => {
		const text = 'Hello<br>World'
    el.innerHTML = text;
		const segments = text.split('<br>')

		expect.assertions(segments.length * 3 + 2)

    makeFragments('div', 'line');

		expect(el.childElementCount).toBe(2)

		const spanList = el.querySelectorAll('span').entries()

		for (const [index, value] of spanList) {
			expect(value).toHaveAttribute('data-line', segments[index])
			expect(value).toHaveAttribute('aria-hidden', 'true')
			expect(value).toHaveTextContent(new RegExp(`^${segments[index]}$`))
		}

    expect(el).toHaveAttribute('aria-label', 'Hello World')
  });

  it('should not modify elements without text content', () => {
		el.textContent = '';
    el.innerHTML = '';

    makeFragments('div', 'char');

    expect(el.innerHTML).toBe('');
    expect(el.childElementCount).toBe(0);
    expect(el.attributes.length).toBe(0);
  });

	it('should limit the search scope', () => {
		el.textContent = 'Hello World'
		const scopedEl = document.createElement('div')
		scopedEl.textContent = 'how are you?'
		document.body.appendChild(scopedEl)

		makeFragments('div', 'char', {
			scope: el
		})

		expect(scopedEl.childElementCount).toBe(0)
		scopedEl.remove()
	})

	it('should limit the number of elements', () => {
		el.textContent = 'Neque porro quisquam est qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit...'

		makeFragments('div', 'word', {
			maxElements: 1
		})

		expect(el.childElementCount).toBe(1)
		const word = el.querySelector('span')
		expect(word).toHaveAttribute('data-word', 'Neque')
		expect(word).toHaveAttribute('aria-hidden', 'true')
	})

	it('should append an ellipsis element', () => {
		el.textContent = 'Neque porro quisquam est qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit...'
		const defaultEllipsisChar = '…'

		makeFragments('div', 'word', {
			maxElements: 1,
			addEllipsis: true
		})

		expect(el.childElementCount).toBe(2)

		const ellipsisEl = el.lastElementChild

		expect(ellipsisEl?.attributes.length).toBe(2)
		expect(ellipsisEl).toHaveAttribute('aria-hidden', 'true')
		expect(ellipsisEl).toHaveAttribute('data-ellipsis', defaultEllipsisChar)
		expect(ellipsisEl).toHaveTextContent(defaultEllipsisChar)
	})

	it('should append a custom ellipsis element', () => {
		el.textContent = 'Neque porro quisquam est qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit...'
		const ellipsisChar = 'Read more...'

		makeFragments('div', 'word', {
			maxElements: 1,
			addEllipsis: true,
			ellipsisText: ellipsisChar
		})

		expect(el.childElementCount).toBe(2)

		const ellipsisEl = el.lastElementChild

		expect(ellipsisEl).toHaveAttribute('aria-hidden', 'true')
		expect(ellipsisEl).toHaveAttribute('data-ellipsis', ellipsisChar)
		expect(ellipsisEl).toHaveTextContent(ellipsisChar)
	})

	it('should set custom classes via string', () => {
		el.textContent = 'Hello'

		makeFragments('div', 'word', {
			fragmentClass: 'custom'
		})

		const span = el.querySelector('span')

		expect(span).toHaveClass('custom')
	})

	it('should set custom classes via function', () => {
		el.textContent = 'Hello World'

		makeFragments('div', 'word', {
			fragmentClass(_index, text) {
				if(text === 'Hello') {
					return 'colorOne'
				}

				if(text === 'World') {
					return 'colorTwo'
				}
			},
		})

		expect(el.querySelector('.colorOne')).toHaveTextContent('Hello')
		expect(el.querySelector('.colorTwo')).toHaveTextContent('World')
	})

	it('should not set custom classes via function when its return value is undefined', () => {
		el.textContent = 'Hello World'

		makeFragments('div', 'word', {
			fragmentClass(_index, text) {
				if(text === 'Hello') {
					return 'colorOne'
				}
			},
		})

		expect(el.querySelector('.colorOne')).toHaveTextContent('Hello')
		expect(el.children[1].classList.length).toBe(0)
	})

	it('should update the segments when the text content changes', () => {
		el.textContent = 'Hello World'

		makeFragments('div', 'word', {
			fragmentClass(_index, text) {
				if(text === 'Hello') {
					return 'whiteText'
				}

				if(text === 'World') {
					return 'blueText'
				}
			},
		})

		expect(el.childElementCount).toBe(2)
		expect(el.querySelector('.whiteText')).toHaveTextContent('Hello')
		expect(el.querySelector('.blueText')).toHaveTextContent('World')

		el.textContent = 'Hello change'

		makeFragments('div', 'word', {
			fragmentClass(_index, text) {
				if(text === 'Hello') {
					return 'whiteText'
				}

				if(text === 'change') {
					return 'blueText'
				}
			},
		})

		expect(el.childElementCount).toBe(2)
		expect(el.querySelector('.whiteText')).toHaveTextContent('Hello')
		expect(el.querySelector('.blueText')).toHaveTextContent('change')
	})

	it('should preserve existing attributes', () => {
		const text = 'Hello';

		el.classList.add('myClass');
		el.setAttribute('data-test', 'value')
		el.setAttribute('aria-label', 'Test')
		el.textContent = text;

		makeFragments(el, 'word');

		expect(el).toHaveClass('myClass')
		expect(el).toHaveAttribute('data-test', 'value')
		expect(el).toHaveAttribute('aria-label', 'Test')
	})
});

describe('validation', () => {
	it('should throw when method is not set', () => {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		expect(() => makeFragments('div', undefined as any)).toThrow('Method is required.')
	})

	it('should throw when method is an invalid type', () => {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		expect(() => makeFragments('div', 'chars' as any)).toThrow('Invalid split method')
	})

	it('should throw when element is an invalid type', () => {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		expect(() => makeFragments(0 as any, 'char')).toThrow('Element must be of type string or HTMLElement.')
	})

	it('should throw when element is not set', () => {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		expect(() => makeFragments(null as any, 'char')).toThrow('Element is not set.')
	})

	it('should throw when maxElements is out of range', () => {
		expect(() => makeFragments('div', 'char', {
			maxElements: 0
		})).toThrow('maxElements value is out of range.')

		expect(() => makeFragments('div', 'char', {
			maxElements: 500
		})).toThrow('maxElements value is out of range.')
	})

	it('should throw when maxElements is an invalid type', () => {
		expect(() => makeFragments('div', 'char', {
			maxElements: 1.5
		})).toThrow('maxElements can only be an integer.')

		expect(() => makeFragments('div', 'char', {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			maxElements: null as any
		})).toThrow('maxElements must be a number.')

		expect(() => makeFragments('div', 'char', {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			maxElements: '' as any
		})).toThrow('maxElements can only be an integer.')
	})

	it('should throw when scope is an invalid type', () => {
		expect(() => makeFragments(el, 'word', {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			scope: 'div' as any
		})).toThrow('scope can only be an HTMLElement or Document.')
	})

	it('should throw when addEllipsis is an invalid type', () => {
		expect(() => makeFragments(el, 'word', {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			addEllipsis: 'div' as any
		})).toThrow('addEllipsis can only be a boolean.')
	})

	it('should throw when ellipsisText is an invalid type', () => {
		expect(() => makeFragments(el, 'word', {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			ellipsisText: null as any
		})).toThrow('ellipsisText can only be a string.')
	})

	it('should throw when fragmentClass is an invalid type', () => {
		expect(() => makeFragments(el, 'word', {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			fragmentClass: 1 as any
		})).toThrow('fragmentClass can only be a string or a function.')
	})
})
