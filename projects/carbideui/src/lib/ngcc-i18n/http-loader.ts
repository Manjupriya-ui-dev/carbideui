import { NgccI18nLoader } from './types';

/**
 * HTTP-based translation loader that fetches translation files from a server.
 * Uses the native fetch API so it can be instantiated outside Angular's DI context.
 *
 * @example
 * ```typescript
 * // Load from JSON files
 * const loader = new HttpNgccI18nLoader('/assets/i18n');
 * // Will load from: /assets/i18n/en.json, /assets/i18n/fr.json, etc.
 *
 * // Load from API endpoint with no extension
 * const loader = new HttpNgccI18nLoader('/api/translations', '');
 * // Will load from: /api/translations/en, /api/translations/fr, etc.
 * ```
 */
export class HttpNgccI18nLoader implements NgccI18nLoader {
  /**
   * Create an HTTP loader.
   * @param baseUrl The base URL or path for translation files (without language suffix)
   * @param fileExtension The file extension to append (default: '.json')
   */
  constructor(
    private baseUrl: string,
    private fileExtension: string = '.json',
  ) {}

  /**
   * Load translations from an HTTP endpoint using the native fetch API.
   * @param language The language code (e.g., 'en', 'fr')
   * @returns Promise resolving to the translation object
   */
  async load(language: string): Promise<Record<string, string>> {
    const url = `${this.baseUrl}/${language}${this.fileExtension}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(
        `Failed to load translations from ${url}: ${response.status} ${response.statusText}`,
      );
    }

    return response.json();
  }
}
