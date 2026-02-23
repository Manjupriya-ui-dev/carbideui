import { Injectable, signal, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { NGCC_I18N_CONFIG } from './tokens';

/**
 * Signals-based, SSR-safe i18n service for Angular applications.
 * Provides translation functionality with lazy loading, caching, fallback language support,
 * and parameter interpolation.
 */
@Injectable()
export class NgccI18nService {
  private readonly config = inject(NGCC_I18N_CONFIG);
  private readonly platformId = inject(PLATFORM_ID);

  // Signal for the current language
  currentLanguage = signal<string>(this.getInitialLanguage());

  // Map to cache loaded translations
  private translationCache: Map<string, Record<string, string>>;

  // Set of languages currently being loaded (to avoid duplicate requests)
  private loadingLanguages = new Set<string>();

  constructor() {
    this.translationCache = this.config.cache || new Map();
  }

  /**
   * Get the initial language based on config and browser settings.
   */
  private getInitialLanguage(): string {
    const defaultLang = this.config.defaultLanguage || 'en';

    // Only use browser language if explicitly enabled and we're in a browser environment
    if (this.config.useBrowserLanguage && isPlatformBrowser(this.platformId)) {
      const browserLang = navigator.language?.split('-')[0] || defaultLang;
      return browserLang;
    }

    return defaultLang;
  }

  /**
   * Set the current language and load translations for that language if needed.
   * @param language The language code to switch to
   */
  async setLanguage(language: string): Promise<void> {
    // Load translations for the language if not already cached
    if (!this.translationCache.has(language)) {
      await this.loadLanguage(language);
    }

    // Also ensure fallback language translations are loaded
    const fallback = this.config.fallbackLanguage || 'en';
    if (fallback !== language && !this.translationCache.has(fallback)) {
      await this.loadLanguage(fallback);
    }

    this.currentLanguage.set(language);
  }

  /**
   * Get the current language.
   */
  getLanguage(): string {
    return this.currentLanguage();
  }

  /**
   * Load translations for a specific language using the configured loader.
   * @param language The language code to load
   */
  private async loadLanguage(language: string): Promise<void> {
    // Avoid duplicate loading requests
    if (this.loadingLanguages.has(language)) {
      // Wait for the ongoing load to complete
      return new Promise((resolve) => {
        const checkInterval = setInterval(() => {
          if (!this.loadingLanguages.has(language)) {
            clearInterval(checkInterval);
            resolve();
          }
        }, 50);
      });
    }

    this.loadingLanguages.add(language);

    try {
      const translations = await this.config.loader.load(language);
      this.translationCache.set(language, translations);
    } finally {
      this.loadingLanguages.delete(language);
    }
  }

  /**
   * Translate a key with optional parameter interpolation.
   * Supports {{paramName}} syntax for parameter substitution.
   * Falls back to fallback language if key is not found in current language.
   * @param key The translation key
   * @param params Optional object with parameters to interpolate
   * @returns The translated string or the key if not found
   */
  t(key: string, params?: Record<string, string | number | boolean>): string {
    const currentLang = this.currentLanguage();
    const fallbackLang = this.config.fallbackLanguage || 'en';

    // Try to get translation from current language
    let translation = this.translationCache.get(currentLang)?.[key];

    // Fall back to fallback language if not found
    if (!translation && currentLang !== fallbackLang) {
      translation = this.translationCache.get(fallbackLang)?.[key];
    }

    // Return key if translation not found
    if (!translation) {
      return key;
    }

    // Interpolate parameters
    if (params) {
      return this.interpolate(translation, params);
    }

    return translation;
  }

  /**
   * Interpolate parameters in a translation string.
   * Replaces {{paramName}} with the corresponding parameter value.
   * @param text The text containing {{param}} placeholders
   * @param params The parameters to substitute
   * @returns The interpolated string
   */
  private interpolate(text: string, params: Record<string, string | number | boolean>): string {
    let result = text;

    for (const [key, value] of Object.entries(params)) {
      const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
      result = result.replace(regex, String(value));
    }

    return result;
  }

  /**
   * Get all loaded translations for the current language.
   * Returns an empty object if the language is not loaded.
   */
  getTranslations(): Record<string, string> {
    return this.translationCache.get(this.currentLanguage()) || {};
  }

  /**
   * Check if a translation key exists in the current language or fallback language.
   */
  has(key: string): boolean {
    const currentLang = this.currentLanguage();
    const fallbackLang = this.config.fallbackLanguage || 'en';

    const existsInCurrent = this.translationCache.get(currentLang)?.hasOwnProperty(key) ?? false;
    const existsInFallback =
      currentLang !== fallbackLang
        ? (this.translationCache.get(fallbackLang)?.hasOwnProperty(key) ?? false)
        : existsInCurrent;

    return existsInCurrent || existsInFallback;
  }

  /**
   * Clear the translation cache.
   */
  clearCache(): void {
    this.translationCache.clear();
  }

  /**
   * Get the underlying translation cache (for testing or advanced use cases).
   * Use with caution in production code.
   */
  getCache(): Map<string, Record<string, string>> {
    return this.translationCache;
  }
}
