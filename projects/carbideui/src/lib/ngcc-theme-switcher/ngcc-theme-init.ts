import { BaseThemeNamesType } from './ngcc-theme.types';

/**
 * Sets the initial theme on the HTML element.
 * Call this once in your consuming app or Storybook preview.
 */
export function initNgccTheme(theme: BaseThemeNamesType = 'white'): void {
  if (typeof document !== 'undefined') {
    document.documentElement.setAttribute('data-carbon-theme', theme);
  }
}
