import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import { NGCC_I18N_CONFIG } from './tokens';
import { NgccI18nConfig } from './types';
import { NgccI18nService } from './service';

/**
 * Provides the NgccI18n service and its configuration to the application.
 * This is the single entry point for setting up i18n — it registers both
 * the configuration token and the service itself.
 *
 * @example
 * ```typescript
 * // In main.ts for standalone apps
 * import { provideNgccI18n, HttpNgccI18nLoader } from '@carbideui/components';
 *
 * bootstrapApplication(AppComponent, {
 *   providers: [
 *     provideNgccI18n({
 *       defaultLanguage: 'en',
 *       fallbackLanguage: 'en',
 *       loader: new HttpNgccI18nLoader('/assets/i18n'),
 *       useBrowserLanguage: true,
 *     }),
 *   ],
 * });
 * ```
 *
 * @param config The i18n configuration
 * @returns EnvironmentProviders to be used with bootstrapApplication or in a providers array
 */
export function provideNgccI18n(config: NgccI18nConfig): EnvironmentProviders {
  return makeEnvironmentProviders([
    { provide: NGCC_I18N_CONFIG, useValue: config },
    NgccI18nService,
  ]);
}
