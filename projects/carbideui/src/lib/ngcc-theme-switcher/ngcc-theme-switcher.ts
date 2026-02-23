import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { NgccThemeService } from './ngcc-theme.service';
import { BaseThemeNamesType } from './ngcc-theme.types';

@Component({
  selector: 'ngcc-theme-switcher',
  templateUrl: './ngcc-theme-switcher.html',
  styleUrls: ['./ngcc-theme-switcher.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NgccThemeSwitcher {
  private readonly themeService = inject(NgccThemeService);

  /** available Ngcc themes */
  protected readonly themes: BaseThemeNamesType[] = [
    'white',
    'g10',
    'g90',
    'g100',
    'rounded',
    'curved',
  ];

  /** current theme signal */
  protected readonly currentTheme = signal(this.themeService.getTheme());

  /** change and persist theme */
  protected setTheme(theme: BaseThemeNamesType): void {
    this.themeService.setTheme(theme);
    this.currentTheme.set(theme);
  }
}
