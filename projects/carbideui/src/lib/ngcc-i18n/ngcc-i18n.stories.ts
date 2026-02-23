import { Meta, StoryObj, moduleMetadata, applicationConfig } from '@storybook/angular';
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgccI18nPipe } from './pipe';
import { NgccI18nService } from './service';
import { provideNgccI18n } from './provider';
import type { NgccI18nLoader } from './types';

// Test loader for Storybook
class StorybookI18nLoader implements NgccI18nLoader {
  async load(language: string): Promise<Record<string, string>> {
    const translations: Record<string, Record<string, string>> = {
      en: {
        greeting: 'Hello',
        page_title: 'Home',
        welcome: 'Welcome, {{name}}!',
        item_count: 'You have {{count}} items',
        button_save: 'Save',
        button_cancel: 'Cancel',
      },
      fr: {
        greeting: 'Bonjour',
        page_title: 'Accueil',
        welcome: 'Bienvenue, {{name}}!',
        item_count: 'Vous avez {{count}} éléments',
        button_save: 'Enregistrer',
        button_cancel: 'Annuler',
      },
      es: {
        greeting: 'Hola',
        page_title: 'Inicio',
        welcome: '¡Bienvenido, {{name}}!',
        item_count: 'Tienes {{count}} elementos',
        button_save: 'Guardar',
        button_cancel: 'Cancelar',
      },
    };
    return translations[language] || translations['en'];
  }
}

/**
 * # NgccI18n Integration Guide
 *
 * A complete guide to implementing internationalization (i18n) in Angular applications
 * using the NgccI18n service and pipe.
 */

const meta: Meta = {
  title: 'NgccI18n/Integration Guide',
  tags: ['i18n', 'internationalization', 'translation'],
  decorators: [
    applicationConfig({
      providers: [
        provideNgccI18n({
          defaultLanguage: 'en',
          fallbackLanguage: 'en',
          loader: new StorybookI18nLoader(),
        }),
      ],
    }),
    moduleMetadata({
      imports: [CommonModule, NgccI18nPipe],
    }),
  ],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
## NgccI18n Integration Guide

Complete step-by-step guide for integrating NgccI18n into your Angular application.

### Features
- 🌍 Signal-based reactive language management
- 📦 Lazy loading with translation caching
- 🔄 Automatic language switching with pipe updates
- 🔧 Customizable loaders for any data source
- 🔒 TypeScript support with full type safety
- ✨ SSR-safe implementation

### Quick Setup

1. **Import in main.ts:**
\`\`\`typescript
import { bootstrapApplication } from '@angular/platform-browser';
import { provideHttpClient } from '@angular/common/http';
import { provideNgccI18n, HttpNgccI18nLoader } from '@carbideui/components';

bootstrapApplication(AppComponent, {
  providers: [
    provideHttpClient(),
    provideNgccI18n({
      defaultLanguage: 'en',
      fallbackLanguage: 'en',
      loader: new HttpNgccI18nLoader('/assets/i18n'),
    }),
  ],
});
\`\`\`

2. **Create translation files in \`public/assets/i18n/\`:**
   - en.json
   - fr.json
   - es.json

3. **Use in templates:**
\`\`\`html
{{ 'greeting' | ngccI18n }}
{{ 'welcome' | ngccI18n: { name: 'Alice' } }}
\`\`\`
        `,
      },
    },
  },
};

export default meta;

// Setup Guide
@Component({
  selector: 'ngcc-i18n-setup-guide',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="setup-guide">
      <h3>Setup & Installation Guide</h3>

      <section>
        <h4>Step 1: Configure in main.ts</h4>
        <pre><code>{{ step1Code }}</code></pre>
      </section>

      <section>
        <h4>Step 2: Create Translation Files</h4>
        <p>Create in <code>public/assets/i18n/</code>:</p>
        <p><strong>en.json:</strong></p>
        <pre><code>{{ step2Code }}</code></pre>
      </section>

      <section>
        <h4>Step 3: Use in Templates</h4>
        <pre><code>{{ step3Code }}</code></pre>
      </section>

      <section>
        <h4>Step 4: Or Use in Components</h4>
        <pre><code>{{ step4Code }}</code></pre>
      </section>
    </div>
  `,
  styles: [
    `
      .setup-guide {
        padding: 20px;
        background-color: #f5f5f5;
        border-radius: 4px;
      }
      h3 {
        margin-top: 0;
        color: #333;
      }
      h4 {
        color: #555;
        margin-top: 20px;
        margin-bottom: 10px;
      }
      section {
        background: white;
        padding: 15px;
        border-radius: 4px;
        margin-bottom: 15px;
        border-left: 4px solid #007bff;
      }
      pre {
        background-color: #f9f9f9;
        border: 1px solid #ddd;
        border-radius: 4px;
        padding: 12px;
        overflow-x: auto;
        font-size: 12px;
        line-height: 1.4;
      }
      code {
        font-family: 'Courier New', monospace;
        color: #333;
      }
      p {
        margin: 10px 0;
      }
    `,
  ],
})
class SetupGuideComponent {
  step1Code = `import { bootstrapApplication } from '@angular/platform-browser';
import { provideHttpClient } from '@angular/common/http';
import { provideNgccI18n, HttpNgccI18nLoader } from '@carbideui/components';

bootstrapApplication(AppComponent, {
  providers: [
    provideHttpClient(),
    provideNgccI18n({
      defaultLanguage: 'en',
      fallbackLanguage: 'en',
      loader: new HttpNgccI18nLoader('/assets/i18n'),
    }),
  ],
});`;

  step2Code = `{
  "greeting": "Hello",
  "welcome": "Welcome, {{name}}!",
  "button_save": "Save",
  "button_cancel": "Cancel"
}`;

  step3Code = `<!-- Simple translation -->
<h1>{{ 'greeting' | ngccI18n }}</h1>

<!-- With parameters -->
<p>{{ 'welcome' | ngccI18n: { name: userName } }}</p>

<!-- Multiple parameters -->
<button>{{ 'button_save' | ngccI18n }}</button>`;

  step4Code = `import { NgccI18nService } from '@carbideui/components';

export class MyComponent {
  private i18n = inject(NgccI18nService);

  greeting = this.i18n.t('greeting');
  welcome = this.i18n.t('welcome', { name: 'Alice' });

  switchLanguage(lang: string) {
    this.i18n.setLanguage(lang).then(() => {
      this.greeting = this.i18n.t('greeting');
    });
  }
}`;
}

export const SetupGuide: StoryObj = {
  decorators: [
    moduleMetadata({
      imports: [SetupGuideComponent],
    }),
  ],
  render: () => ({
    template: `<ngcc-i18n-setup-guide></ngcc-i18n-setup-guide>`,
  }),
  parameters: {
    docs: {
      description: {
        story: `
Complete setup guide for integrating NgccI18n into your Angular application.
Follow all 4 steps to get i18n working in your app.
        `,
      },
    },
  },
};

// Example 1: Simple Translation
@Component({
  selector: 'ngcc-i18n-simple-example',
  standalone: true,
  imports: [CommonModule, NgccI18nPipe],
  template: `
    <div class="example-container">
      <h3>Simple Translation</h3>
      <div class="content">
        <p>{{ 'greeting' | ngccI18n }}</p>
        <p>{{ 'page_title' | ngccI18n }}</p>
      </div>
      <p class="description">
        Uses the pipe directly in templates. The pipe automatically updates when the language
        changes.
      </p>
    </div>
  `,
  styles: [
    `
      .example-container {
        padding: 20px;
        border: 1px solid #ddd;
        border-radius: 4px;
        margin-bottom: 20px;
        background-color: #f9f9f9;
      }
      h3 {
        margin-top: 0;
        color: #333;
      }
      .content {
        background: white;
        padding: 15px;
        border-radius: 4px;
        margin: 10px 0;
      }
      .description {
        font-size: 12px;
        color: #666;
        margin-top: 10px;
        font-style: italic;
      }
    `,
  ],
})
class SimpleTranslationComponent {}

export const SimpleTranslation: StoryObj = {
  decorators: [
    moduleMetadata({
      imports: [SimpleTranslationComponent],
    }),
  ],
  render: () => ({
    template: `<ngcc-i18n-simple-example></ngcc-i18n-simple-example>`,
  }),
  parameters: {
    docs: {
      description: {
        story: `
Simple translation using the pipe. No parameters needed.

**Template:**
\`\`\`html
<p>{{ 'greeting' | ngccI18n }}</p>
\`\`\`

**Translation file (en.json):**
\`\`\`json
{
  "greeting": "Hello",
  "page_title": "Home"
}
\`\`\`
        `,
      },
    },
  },
};

// Example 2: Translation with Parameters
@Component({
  selector: 'ngcc-i18n-params-example',
  standalone: true,
  imports: [CommonModule, NgccI18nPipe],
  template: `
    <div class="example-container">
      <h3>Translation with Parameters</h3>
      <div class="content">
        <p>{{ 'welcome' | ngccI18n: { name: 'Alice' } }}</p>
        <p>{{ 'item_count' | ngccI18n: { count: 5 } }}</p>
      </div>
      <p class="description">
        Parameters are interpolated using {{ param }} syntax. Multiple parameters are supported.
      </p>
    </div>
  `,
  styles: [
    `
      .example-container {
        padding: 20px;
        border: 1px solid #ddd;
        border-radius: 4px;
        margin-bottom: 20px;
        background-color: #f9f9f9;
      }
      h3 {
        margin-top: 0;
        color: #333;
      }
      .content {
        background: white;
        padding: 15px;
        border-radius: 4px;
        margin: 10px 0;
      }
      .description {
        font-size: 12px;
        color: #666;
        margin-top: 10px;
        font-style: italic;
      }
    `,
  ],
})
class ParameterTranslationComponent {}

export const ParameterTranslation: StoryObj = {
  decorators: [
    moduleMetadata({
      imports: [ParameterTranslationComponent],
    }),
  ],
  render: () => ({
    template: `<ngcc-i18n-params-example></ngcc-i18n-params-example>`,
  }),
  parameters: {
    docs: {
      description: {
        story: `
Translations with dynamic parameters substituted at runtime.

**Template:**
\`\`\`html
<p>{{ 'welcome' | ngccI18n: { name: 'Alice' } }}</p>
<p>{{ 'item_count' | ngccI18n: { count: itemCount } }}</p>
\`\`\`

**Translation file (en.json):**
\`\`\`json
{
  "welcome": "Welcome, {{name}}!",
  "item_count": "You have {{count}} items"
}
\`\`\`

Parameters are interpolated using the \`{{key}}\` syntax in translation strings.
        `,
      },
    },
  },
};

// Example 3: Language Switcher
@Component({
  selector: 'ngcc-i18n-switcher-example',
  standalone: true,
  imports: [CommonModule, NgccI18nPipe],
  template: `
    <div class="example-container">
      <h3>Language Switcher</h3>
      <div class="language-buttons">
        <button
          *ngFor="let lang of languages"
          (click)="switchLanguage(lang)"
          [class.active]="currentLanguage === lang"
          class="lang-button"
        >
          {{ lang.toUpperCase() }}
        </button>
      </div>
      <div class="content">
        <p>{{ 'greeting' | ngccI18n }}</p>
        <p>{{ 'welcome' | ngccI18n: { name: 'User' } }}</p>
      </div>
      <p class="description">
        Click the language buttons above to switch languages. All translations update automatically.
      </p>
    </div>
  `,
  styles: [
    `
      .example-container {
        padding: 20px;
        border: 1px solid #ddd;
        border-radius: 4px;
        margin-bottom: 20px;
        background-color: #f9f9f9;
      }
      h3 {
        margin-top: 0;
        color: #333;
      }
      .language-buttons {
        display: flex;
        gap: 10px;
        margin: 15px 0;
      }
      .lang-button {
        padding: 8px 16px;
        background-color: #e0e0e0;
        color: #333;
        border: 2px solid transparent;
        border-radius: 4px;
        cursor: pointer;
        font-weight: 500;
        transition: all 0.3s ease;
      }
      .lang-button:hover {
        background-color: #d0d0d0;
      }
      .lang-button.active {
        background-color: #007bff;
        color: white;
        border-color: #0056b3;
      }
      .content {
        background: white;
        padding: 15px;
        border-radius: 4px;
        margin: 10px 0;
      }
      .description {
        font-size: 12px;
        color: #666;
        margin-top: 10px;
        font-style: italic;
      }
    `,
  ],
})
class LanguageSwitcherComponent {
  private i18n = inject(NgccI18nService);

  languages = ['en', 'fr', 'es'];
  currentLanguage = 'en';

  async switchLanguage(lang: string) {
    await this.i18n.setLanguage(lang);
    this.currentLanguage = lang;
  }
}

export const LanguageSwitcher: StoryObj = {
  decorators: [
    moduleMetadata({
      imports: [LanguageSwitcherComponent],
    }),
  ],
  render: () => ({
    template: `<ngcc-i18n-switcher-example></ngcc-i18n-switcher-example>`,
  }),
  parameters: {
    docs: {
      description: {
        story: `
Interactive language switcher component that demonstrates reactive language changes.

**Component:**
\`\`\`typescript
export class LanguageSwitcherComponent {
  private i18n = inject(NgccI18nService);
  languages = ['en', 'fr', 'es'];
  currentLanguage = 'en';

  async switchLanguage(lang: string) {
    await this.i18n.setLanguage(lang);
    this.currentLanguage = lang;
    // UI automatically updates via pipe
  }
}
\`\`\`

**Template:**
\`\`\`html
<button (click)="switchLanguage('en')">English</button>
<button (click)="switchLanguage('fr')">Français</button>
<button (click)="switchLanguage('es')">Español</button>

<p>{{ 'greeting' | ngccI18n }}</p>
\`\`\`
        `,
      },
    },
  },
};

// Example 4: Service Usage
@Component({
  selector: 'ngcc-i18n-service-example',
  standalone: true,
  imports: [CommonModule, NgccI18nPipe],
  template: `
    <div class="example-container">
      <h3>Using Service in Component</h3>
      <div class="content">
        <p>
          Greeting (from service): <strong>{{ greeting }}</strong>
        </p>
        <p>
          Welcome (from service): <strong>{{ welcome }}</strong>
        </p>
        <p>
          Current Language: <strong>{{ currentLanguage }}</strong>
        </p>
      </div>
      <div class="button-group">
        <button (click)="updateTranslations()">Refresh Translations</button>
        <button (click)="checkKey()">Check if Key Exists</button>
      </div>
      <p class="description">
        The service can be injected into components for programmatic access to translations.
      </p>
    </div>
  `,
  styles: [
    `
      .example-container {
        padding: 20px;
        border: 1px solid #ddd;
        border-radius: 4px;
        margin-bottom: 20px;
        background-color: #f9f9f9;
      }
      h3 {
        margin-top: 0;
        color: #333;
      }
      .content {
        background: white;
        padding: 15px;
        border-radius: 4px;
        margin: 10px 0;
      }
      .button-group {
        display: flex;
        gap: 10px;
        margin: 15px 0;
      }
      button {
        padding: 8px 16px;
        background-color: #28a745;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 14px;
      }
      button:hover {
        background-color: #218838;
      }
      .description {
        font-size: 12px;
        color: #666;
        margin-top: 10px;
        font-style: italic;
      }
    `,
  ],
})
class ServiceUsageComponent {
  private i18n = inject(NgccI18nService);

  greeting = '';
  welcome = '';
  currentLanguage = '';

  constructor() {
    this.updateTranslations();
  }

  updateTranslations() {
    this.currentLanguage = this.i18n.getLanguage();
    this.greeting = this.i18n.t('greeting');
    this.welcome = this.i18n.t('welcome', { name: 'Service User' });
  }

  checkKey() {
    const hasGreeting = this.i18n.has('greeting');
    alert(`Translation key 'greeting' exists: ${hasGreeting}`);
  }
}

export const ServiceUsage: StoryObj = {
  decorators: [
    moduleMetadata({
      imports: [ServiceUsageComponent],
    }),
  ],
  render: () => ({
    template: `<ngcc-i18n-service-example></ngcc-i18n-service-example>`,
  }),
  parameters: {
    docs: {
      description: {
        story: `
Using NgccI18nService directly in components for programmatic translation access.

**Component:**
\`\`\`typescript
export class MyComponent {
  private i18n = inject(NgccI18nService);
  greeting = '';

  ngOnInit() {
    // Get translation
    this.greeting = this.i18n.t('greeting');
    
    // Get with parameters
    const message = this.i18n.t('welcome', { name: 'Alice' });
    
    // Get current language
    const lang = this.i18n.getLanguage();
    
    // Check if key exists
    if (this.i18n.has('greeting')) {
      // ...
    }
  }

  switchLanguage(lang: string) {
    this.i18n.setLanguage(lang).then(() => {
      this.greeting = this.i18n.t('greeting');
    });
  }
}
\`\`\`

**Service API:**
- \`t(key, params?): string\` - Translate a key
- \`setLanguage(lang): Promise<void>\` - Set language
- \`getLanguage(): string\` - Get current language
- \`has(key): boolean\` - Check if translation exists
- \`clearCache(): void\` - Clear translation cache
        `,
      },
    },
  },
};

// Best Practices
@Component({
  selector: 'ngcc-i18n-best-practices',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="best-practices">
      <h3>Best Practices</h3>

      <div class="practice">
        <h4>✅ Use Descriptive Key Names</h4>
        <p><code>page_title</code>, <code>button_submit</code>, <code>error_validation</code></p>
        <p class="description">Group related keys with prefixes for organization</p>
      </div>

      <div class="practice">
        <h4>✅ Use the Pipe in Templates</h4>
        <p><code>{{ 'greeting' | ngccI18n }}</code></p>
        <p class="description">The pipe is optimized for template updates and automatic language switching</p>
      </div>

      <div class="practice">
        <h4>✅ Use Service in Component Logic</h4>
        <p><code>const msg = this.i18n.t('greeting');</code></p>
        <p class="description">Use the service when you need programmatic access in TypeScript</p>
      </div>

      <div class="practice">
        <h4>✅ Handle Missing Translations</h4>
        <p><code>if (this.i18n.has('key')) { }</code></p>
        <p class="description">Check if a translation exists before using it</p>
      </div>

      <div class="practice">
        <h4>✅ Type-Safe Parameters</h4>
        <p><code>{ name: 'Alice', count: 5, isActive: true }</code></p>
        <p class="description">Parameters can be strings, numbers, or booleans</p>
      </div>

      <div class="practice">
        <h4>✅ Preload Languages for Better Performance</h4>
        <p>Load multiple languages upfront to avoid delays when switching</p>
        <p class="description">Useful for multi-language apps where users frequently switch languages</p>
      </div>
    </div>
  `,
  styles: [
    `
      .best-practices {
        padding: 20px;
        background-color: #f5f5f5;
        border-radius: 4px;
      }
      h3 {
        margin-top: 0;
        color: #333;
      }
      .practice {
        background: white;
        padding: 15px;
        border-radius: 4px;
        margin-bottom: 15px;
        border-left: 4px solid #28a745;
      }
      h4 {
        margin-top: 0;
        color: #333;
      }
      code {
        background-color: #f0f0f0;
        padding: 2px 6px;
        border-radius: 3px;
        font-family: 'Courier New', monospace;
        color: #d63384;
      }
      .description {
        margin: 5px 0 0 0;
        font-size: 13px;
        color: #666;
        font-style: italic;
      }
    `,
  ],
})
class BestPracticesComponent {}

export const BestPractices: StoryObj = {
  decorators: [
    moduleMetadata({
      imports: [BestPracticesComponent],
    }),
  ],
  render: () => ({
    template: `<ngcc-i18n-best-practices></ngcc-i18n-best-practices>`,
  }),
  parameters: {
    docs: {
      description: {
        story: `
Follow these best practices for effective i18n implementation.
        `,
      },
    },
  },
};
