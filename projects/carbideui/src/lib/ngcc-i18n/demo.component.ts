import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgccI18nService, NgccI18nPipe } from './index';

/**
 * Demonstration component showing all NgccI18n features.
 * This component showcases:
 * - Using the service for translations
 * - Using the pipe in templates
 * - Language switching
 * - Parameter interpolation
 * - Reactive language changes
 */
@Component({
  selector: 'ngcc-i18n-demo',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, NgccI18nPipe],
  template: `
    <div class="i18n-demo">
      <section>
        <h2>{{ 'page_title' | ngccI18n }}</h2>
        <p>{{ greeting }}</p>
        <p>{{ 'welcome' | ngccI18n: { name: 'Angular' } }}</p>
      </section>

      <section>
        <h3>{{ 'user_greeting' | ngccI18n: { firstName: 'John', lastName: 'Doe' } }}</h3>
        <p>{{ 'items_count' | ngccI18n: { count: items.length } }}</p>
      </section>

      <section>
        <h3>Language Switcher</h3>
        <div class="button-group">
          <button (click)="setLanguage('en')">English</button>
          <button (click)="setLanguage('fr')">Français</button>
          <button (click)="setLanguage('es')">Español</button>
        </div>
        <p>{{ 'loading' | ngccI18n }}</p>
      </section>

      <section>
        <h3>Using Service in Component</h3>
        <p>
          Current Language: <strong>{{ currentLanguage }}</strong>
        </p>
        <p>{{ serviceGreeting }}</p>
      </section>

      <section>
        <h3>Error Handling</h3>
        <p>{{ 'error_message' | ngccI18n: { errorCode: 404 } }}</p>
        <p>{{ 'success_message' | ngccI18n }}</p>
      </section>

      <section>
        <h3>Buttons</h3>
        <button>{{ 'button_save' | ngccI18n }}</button>
        <button>{{ 'button_cancel' | ngccI18n }}</button>
        <button>{{ 'button_delete' | ngccI18n }}</button>
      </section>
    </div>
  `,
  styles: [
    `
      .i18n-demo {
        padding: 20px;
        font-family: Arial, sans-serif;
      }

      section {
        margin-bottom: 30px;
        padding: 15px;
        border: 1px solid #ccc;
        border-radius: 4px;
      }

      h2 {
        color: #333;
        margin-top: 0;
      }

      h3 {
        color: #666;
        font-size: 16px;
      }

      p {
        margin: 10px 0;
        line-height: 1.5;
      }

      .button-group {
        display: flex;
        gap: 10px;
        margin: 10px 0;
      }

      button {
        padding: 8px 16px;
        background-color: #007bff;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 14px;
      }

      button:hover {
        background-color: #0056b3;
      }
    `,
  ],
})
export class NgccI18nDemoComponent implements OnInit {
  private i18n = inject(NgccI18nService);

  greeting = '';
  serviceGreeting = '';
  currentLanguage = '';
  items = ['Item 1', 'Item 2', 'Item 3'];

  ngOnInit(): void {
    this.updateContent();
  }

  async setLanguage(language: string): Promise<void> {
    await this.i18n.setLanguage(language);
    this.updateContent();
  }

  private updateContent(): void {
    this.currentLanguage = this.i18n.getLanguage();
    this.greeting = this.i18n.t('greeting');
    this.serviceGreeting = this.i18n.t('welcome', { name: this.currentLanguage.toUpperCase() });
  }
}
