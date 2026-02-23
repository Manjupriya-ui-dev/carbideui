import { Injectable } from '@angular/core';
import { initNgccTheme } from './ngcc-theme-init';
import { BaseThemeNamesType } from './ngcc-theme.types';

@Injectable({ providedIn: 'root' })
export class NgccThemeService {
  private theme: BaseThemeNamesType;

  constructor() {
    const saved = sessionStorage.getItem('ngcc-theme') as BaseThemeNamesType;
    this.theme = saved || 'white';
    initNgccTheme(this.theme); // set global attribute immediately
  }

  setTheme(theme: BaseThemeNamesType): void {
    this.theme = theme;
    sessionStorage.setItem('ngcc-theme', theme);
    initNgccTheme(theme);
  }

  getTheme(): BaseThemeNamesType {
    return this.theme;
  }
}
