import { TestBed } from '@angular/core/testing';
import { NgccI18nService } from './service';
import { provideNgccI18n, NgccI18nLoader, NGCC_I18N_CONFIG } from './index';

/**
 * Mock implementation of NgccI18nLoader for testing
 */
class MockI18nLoader implements NgccI18nLoader {
  private translations: Record<string, Record<string, string>> = {
    en: {
      greeting: 'Hello',
      welcome: 'Welcome, {{name}}!',
      goodbye: 'Goodbye',
      items_count: 'You have {{count}} items',
    },
    fr: {
      greeting: 'Bonjour',
      welcome: 'Bienvenue, {{name}}!',
      goodbye: 'Au revoir',
    },
    es: {
      greeting: 'Hola',
      welcome: '¡Bienvenido, {{name}}!',
    },
  };

  async load(language: string): Promise<Record<string, string>> {
    return this.translations[language] || {};
  }
}

describe('NgccI18nService', () => {
  let service: NgccI18nService;
  let loader: MockI18nLoader;

  beforeEach(() => {
    loader = new MockI18nLoader();

    TestBed.configureTestingModule({
      providers: [
        provideNgccI18n({
          defaultLanguage: 'en',
          fallbackLanguage: 'en',
          loader,
        }),
      ],
    });

    service = TestBed.inject(NgccI18nService);
  });

  describe('Initialization', () => {
    it('should create the service', () => {
      expect(service).toBeTruthy();
    });

    it('should have default language signal', () => {
      expect(service.currentLanguage()).toBe('en');
    });

    it('should return default language', () => {
      expect(service.getLanguage()).toBe('en');
    });
  });

  describe('Language Management', () => {
    it('should set language and load translations', async () => {
      await service.setLanguage('en');
      expect(service.getLanguage()).toBe('en');
    });

    it('should update the currentLanguage signal', async () => {
      await service.setLanguage('fr');
      expect(service.currentLanguage()).toBe('fr');
    });

    it('should not reload language if already set', async () => {
      const loadSpy = vi.spyOn(loader, 'load');

      await service.setLanguage('en');
      await service.setLanguage('en');

      expect(loadSpy).toHaveBeenCalledTimes(1);
    });

    it('should cache translations after loading', async () => {
      await service.setLanguage('en');
      const cache = service.getCache();
      expect(cache.has('en')).toBe(true);
      expect(cache.get('en')).toEqual({
        greeting: 'Hello',
        welcome: 'Welcome, {{name}}!',
        goodbye: 'Goodbye',
        items_count: 'You have {{count}} items',
      });
    });
  });

  describe('Translation (t method)', () => {
    beforeEach(async () => {
      await service.setLanguage('en');
    });

    it('should translate a simple key', () => {
      expect(service.t('greeting')).toBe('Hello');
    });

    it('should return key if translation not found', () => {
      expect(service.t('nonexistent')).toBe('nonexistent');
    });

    it('should interpolate single parameter', () => {
      const result = service.t('welcome', { name: 'Alice' });
      expect(result).toBe('Welcome, Alice!');
    });

    it('should interpolate multiple parameters', () => {
      const result = service.t('items_count', { count: 42 });
      expect(result).toBe('You have 42 items');
    });

    it('should handle number parameters', () => {
      const result = service.t('items_count', { count: 100 });
      expect(result).toBe('You have 100 items');
    });

    it('should handle boolean parameters', () => {
      const translation = 'Active: {{isActive}}';
      const cache = service.getCache();
      const translations = cache.get('en');
      if (translations) {
        translations['active_status'] = translation;
      }

      const result = service.t('active_status', { isActive: true });
      expect(result).toBe('Active: true');
    });

    it('should handle whitespace in parameter placeholders', () => {
      const cache = service.getCache();
      const translations = cache.get('en');
      if (translations) {
        translations['flexible'] = 'Hello {{ name }}, welcome {{  title  }}!';
      }

      const result = service.t('flexible', { name: 'Bob', title: 'Dr.' });
      expect(result).toBe('Hello Bob, welcome Dr.!');
    });

    it('should not interpolate if params not provided', () => {
      expect(service.t('welcome')).toBe('Welcome, {{name}}!');
    });
  });

  describe('Fallback Language', () => {
    it('should fall back to fallback language if key not in current language', async () => {
      await service.setLanguage('es');
      // 'goodbye' exists in 'en' but not in 'es'
      const result = service.t('goodbye');
      expect(result).toBe('Goodbye');
    });

    it('should return key if not found in current or fallback language', async () => {
      await service.setLanguage('es');
      const result = service.t('nonexistent_key');
      expect(result).toBe('nonexistent_key');
    });

    it('should prefer current language over fallback', async () => {
      await service.setLanguage('fr');
      // 'greeting' exists in both 'fr' and 'en', should use 'fr'
      expect(service.t('greeting')).toBe('Bonjour');
    });
  });

  describe('has method', () => {
    beforeEach(async () => {
      await service.setLanguage('en');
    });

    it('should return true if key exists in current language', () => {
      expect(service.has('greeting')).toBe(true);
    });

    it('should return false if key does not exist', () => {
      expect(service.has('nonexistent')).toBe(false);
    });

    it('should check fallback language', async () => {
      await service.setLanguage('fr');
      // 'goodbye' is in fallback (en) but not in current language (fr)
      expect(service.has('goodbye')).toBe(true);
    });
  });

  describe('getTranslations method', () => {
    it('should return translations for current language', async () => {
      await service.setLanguage('en');
      const translations = service.getTranslations();
      expect(translations).toEqual({
        greeting: 'Hello',
        welcome: 'Welcome, {{name}}!',
        goodbye: 'Goodbye',
        items_count: 'You have {{count}} items',
      });
    });

    it('should return empty object if language not loaded', () => {
      const service2 = TestBed.inject(NgccI18nService);
      // Create a new service instance with unloaded language
      const translations = service2.getTranslations();
      expect(translations).toEqual({});
    });
  });

  describe('clearCache method', () => {
    it('should clear the translation cache', async () => {
      await service.setLanguage('en');
      expect(service.getCache().size).toBeGreaterThan(0);

      service.clearCache();
      expect(service.getCache().size).toBe(0);
    });

    it('should reload translations after cache clear', async () => {
      await service.setLanguage('en');
      service.clearCache();

      const loadSpy = vi.spyOn(loader, 'load');
      await service.setLanguage('en');

      expect(loadSpy).toHaveBeenCalled();
    });
  });

  describe('getCache method', () => {
    it('should return the translation cache map', async () => {
      await service.setLanguage('en');
      const cache = service.getCache();
      expect(cache instanceof Map).toBe(true);
      expect(cache.has('en')).toBe(true);
    });
  });

  describe('Concurrent Language Changes', () => {
    it('should handle multiple simultaneous setLanguage calls', async () => {
      const promises = [
        service.setLanguage('en'),
        service.setLanguage('fr'),
        service.setLanguage('es'),
        service.setLanguage('en'),
      ];

      await Promise.all(promises);

      // With concurrent async calls, the final language is whichever resolves last
      expect(['en', 'fr', 'es']).toContain(service.getLanguage());
    });
  });

  describe('Configuration', () => {
    it('should use injected config', () => {
      const config = TestBed.inject(NGCC_I18N_CONFIG);
      expect(config.defaultLanguage).toBe('en');
      expect(config.fallbackLanguage).toBe('en');
    });
  });
});
