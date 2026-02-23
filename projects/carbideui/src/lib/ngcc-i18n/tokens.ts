import { InjectionToken } from '@angular/core';
import { NgccI18nConfig } from './types';

/**
 * Injection token for providing i18n configuration.
 * Use with provideNgccI18n(config) to set up the i18n service.
 */
export const NGCC_I18N_CONFIG = new InjectionToken<NgccI18nConfig>('NGCC_I18N_CONFIG');
