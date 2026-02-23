import { Pipe, PipeTransform, inject } from '@angular/core';
import { NgccI18nService } from './service';

/**
 * Standalone i18n pipe for Angular templates.
 * Translates a key using the NgccI18nService and optionally interpolates parameters.
 * Set to pure: false to update when language changes via the service signal.
 *
 * @example
 * ```html
 * <!-- Simple translation -->
 * <p>{{ 'greeting' | ngccI18n }}</p>
 *
 * <!-- Translation with parameters -->
 * <p>{{ 'welcome' | ngccI18n: { name: 'John' } }}</p>
 * ```
 */
@Pipe({
  name: 'ngccI18n',
  standalone: true,
  pure: false,
})
export class NgccI18nPipe implements PipeTransform {
  private readonly i18nService = inject(NgccI18nService);

  /**
   * Transform a translation key to its translated value.
   * @param key The translation key
   * @param params Optional parameters for interpolation
   * @returns The translated string
   */
  transform(key: string, params?: Record<string, string | number | boolean>): string {
    // Trigger signal dependency to ensure pipe updates when language changes
    this.i18nService.currentLanguage();

    return this.i18nService.t(key, params);
  }
}
