/**
 * Interface for implementing custom translation loaders.
 * Implement this interface to provide translations from any source.
 */
export interface NgccI18nLoader {
  /**
   * Load translations for a specific language.
   * @param language The language code (e.g., 'en', 'fr', 'es')
   * @returns Promise resolving to a Record of translation key-value pairs
   */
  load(language: string): Promise<Record<string, string>>;
}

/**
 * Configuration options for the i18n service.
 */
export interface NgccI18nConfig {
  /**
   * The initial/default language
   * @default 'en'
   */
  defaultLanguage?: string;

  /**
   * The fallback language to use if a translation is not found in the current language
   * @default 'en'
   */
  fallbackLanguage?: string;

  /**
   * The loader implementation to use for loading translations
   */
  loader: NgccI18nLoader;

  /**
   * Optional cache for storing loaded translations to avoid reloading
   * @default new Map()
   */
  cache?: Map<string, Record<string, string>>;

  /**
   * Whether to use the browser's language preference (via navigator.language)
   * @default false
   */
  useBrowserLanguage?: boolean;
}
