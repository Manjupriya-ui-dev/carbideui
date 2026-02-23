import { TestBed } from '@angular/core/testing';
import { NgccI18nPipe } from './pipe';
import { NgccI18nService } from './service';
import { provideNgccI18n, NgccI18nLoader } from './index';

class MockI18nLoader implements NgccI18nLoader {
  private translations: Record<string, Record<string, string>> = {
    en: {
      greeting: 'Hello',
      welcome: 'Welcome, {{name}}!',
    },
    fr: {
      greeting: 'Bonjour',
      welcome: 'Bienvenue, {{name}}!',
    },
  };

  async load(language: string): Promise<Record<string, string>> {
    return this.translations[language] || {};
  }
}

describe('NgccI18nPipe', () => {
  let pipe: NgccI18nPipe;
  let i18nService: NgccI18nService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        NgccI18nPipe,
        provideNgccI18n({
          defaultLanguage: 'en',
          fallbackLanguage: 'en',
          loader: new MockI18nLoader(),
        }),
      ],
    });

    pipe = TestBed.inject(NgccI18nPipe);
    i18nService = TestBed.inject(NgccI18nService);
  });

  it('should create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should transform a translation key', async () => {
    await i18nService.setLanguage('en');
    const result = pipe.transform('greeting');
    expect(result).toBe('Hello');
  });

  it('should transform with parameters', async () => {
    await i18nService.setLanguage('en');
    const result = pipe.transform('welcome', { name: 'Alice' });
    expect(result).toBe('Welcome, Alice!');
  });

  it('should return key if translation not found', async () => {
    await i18nService.setLanguage('en');
    const result = pipe.transform('nonexistent');
    expect(result).toBe('nonexistent');
  });

  it('should respect language changes', async () => {
    await i18nService.setLanguage('en');
    let result = pipe.transform('greeting');
    expect(result).toBe('Hello');

    await i18nService.setLanguage('fr');
    result = pipe.transform('greeting');
    expect(result).toBe('Bonjour');
  });
});
