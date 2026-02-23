/**
 * Public API for the NgccI18n module.
 * Exports all public types, services, pipes, and provider functions.
 */

export { NgccI18nService } from './service';
export { NgccI18nPipe } from './pipe';
export { HttpNgccI18nLoader } from './http-loader';
export { provideNgccI18n } from './provider';
export { NGCC_I18N_CONFIG } from './tokens';
export type { NgccI18nConfig, NgccI18nLoader } from './types';
