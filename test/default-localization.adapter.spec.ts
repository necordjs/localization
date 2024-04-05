import { DefaultLocalizationAdapter } from '../src/adapters';

describe('DefaultLocalizationAdapter', () => {
	const adapter = new DefaultLocalizationAdapter({
		fallbackLocale: 'en',
		locales: {
			en: {
				hello: 'Hello, {{ name }}!'
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
});
