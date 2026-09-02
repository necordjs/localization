import { DefaultLocalizationAdapter } from '../src/adapters/index.js';

describe('DefaultLocalizationAdapter', () => {
	const adapter = new DefaultLocalizationAdapter({
		fallbackLocale: 'en',
		locales: {
			en: {
				hello: 'Hello, {{ name }}!',
				invalid: '{{a{b}}'
			}
		}
	});

	it('should translate locale', () => {
		expect(adapter.getTranslation('hello', 'en', { name: 'world' })).toBe('Hello, world!');
	});

	it('should translate fallback locale', () => {
		expect(adapter.getTranslation('hello', 'es', { name: 'world' })).toBe('Hello, world!');
	});

	it('should replace placeholders', () => {
		expect(adapter.getTranslation('hello', 'en', { name: 'world' })).toBe('Hello, world!');
	});

	it('should return key if translation not found', () => {
		expect(adapter.getTranslation('goodbye', 'en', { name: 'world' })).toBe('goodbye');
	});

	it('should not interpolate placeholder keys containing braces', () => {
		expect(adapter.getTranslation('invalid', 'en', { 'a{b': 'unsafe' })).toBe('{{a{b}}');
	});
});
