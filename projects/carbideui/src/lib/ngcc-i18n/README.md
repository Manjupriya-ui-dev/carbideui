# NgccI18n - Angular Internationalization Service

A modern, signals-based internationalization (i18n) solution for Angular applications. Built for Angular v20/v21+, SSR-safe, and framework-agnostic translation support.

## Features

✅ **Signals-based Architecture** - Modern Angular reactivity with `signal<string>` for current language  
✅ **Lazy Loading** - Load translations on-demand with automatic caching  
✅ **Fallback Language Support** - Graceful fallback when translations are missing  
✅ **Parameter Interpolation** - Replace `{{param}}` placeholders with values  
✅ **SSR-Safe** - Works seamlessly with Angular Universal  
✅ **Standalone** - Fully standalone service and pipe for Angular 14+  
✅ **TypeScript Support** - Full type safety with interfaces  
✅ **No Dependencies** - No external i18n libraries required  
✅ **HTTP Loader** - Built-in loader for JSON translation files  
✅ **Custom Loaders** - Easily implement custom loaders for any data source  

## Installation

The NgccI18n module is part of the `carbideui` library. It's ready to use out of the box.

## Quick Start

### 1. Setup in main.ts (Standalone App)

```typescript
import { bootstrapApplication } from '@angular/platform-browser';
import { provideHttpClient } from '@angular/common/http';
import { provideNgccI18n, HttpNgccI18nLoader } from '@carbideui/components';
import { AppComponent } from './app/app.component';

const httpLoader = new HttpNgccI18nLoader('/assets/i18n');

bootstrapApplication(AppComponent, {
  providers: [
    provideHttpClient(),
    provideNgccI18n({
      defaultLanguage: 'en',
      fallbackLanguage: 'en',
      loader: httpLoader,
      useBrowserLanguage: true, // Optional: auto-detect browser language
    }),
  ],
}).catch((err) => console.error(err));
```

### 2. Create Translation Files

Create JSON files in `public/assets/i18n/`:

**en.json:**
```json
{
  "greeting": "Hello",
  "welcome": "Welcome, {{name}}!",
  "goodbye": "Goodbye"
}
```

**fr.json:**
```json
{
  "greeting": "Bonjour",
  "welcome": "Bienvenue, {{name}}!",
  "goodbye": "Au revoir"
}
```

### 3. Use in Components

**Using the Service:**
```typescript
import { Component, OnInit, inject } from '@angular/core';
import { NgccI18nService } from '@carbideui/components';

@Component({
  selector: 'app-root',
  standalone: true,
  template: `<p>{{ greeting }}</p>`,
})
export class AppComponent implements OnInit {
  private i18n = inject(NgccI18nService);
  greeting = '';

  ngOnInit(): void {
    this.greeting = this.i18n.t('greeting');
  }

  switchLanguage(lang: string) {
    this.i18n.setLanguage(lang).then(() => {
      this.greeting = this.i18n.t('greeting');
    });
  }
}
```

**Using the Pipe in Templates:**
```typescript
import { Component } from '@angular/core';
import { NgccI18nPipe } from '@carbideui/components';

@Component({
  selector: 'app-demo',
  standalone: true,
  imports: [NgccI18nPipe],
  template: `
    <h1>{{ 'greeting' | ngccI18n }}</h1>
    <p>{{ 'welcome' | ngccI18n: { name: 'Alice' } }}</p>
  `,
})
export class DemoComponent {}
```

## API Reference

### NgccI18nService

#### Properties

- `currentLanguage: Signal<string>` - Reactive signal for the current language

#### Methods

- `setLanguage(language: string): Promise<void>` - Set the current language and load translations
- `getLanguage(): string` - Get the current language
- `t(key: string, params?: Record<string, string | number | boolean>): string` - Translate a key
- `has(key: string): boolean` - Check if a translation key exists
- `getTranslations(): Record<string, string>` - Get all translations for current language
- `clearCache(): void` - Clear the translation cache
- `getCache(): Map<string, Record<string, string>>` - Get the cache (for testing)

### NgccI18nPipe

Standalone pipe for use in templates.

**Syntax:**
```html
{{ key | ngccI18n }}
{{ key | ngccI18n: { param1: value1, param2: value2 } }}
```

**Examples:**
```html
<!-- Simple translation -->
<h1>{{ 'page_title' | ngccI18n }}</h1>

<!-- With parameters -->
<p>{{ 'user_greeting' | ngccI18n: { name: userName } }}</p>

<!-- In loops -->
<div *ngFor="let item of items">
  {{ item.labelKey | ngccI18n: { count: item.count } }}
</div>
```

### NgccI18nLoader Interface

Implement this to create custom loaders:

```typescript
interface NgccI18nLoader {
  load(language: string): Promise<Record<string, string>>;
}
```

### NgccI18nConfig Interface

```typescript
interface NgccI18nConfig {
  defaultLanguage?: string;        // Default: 'en'
  fallbackLanguage?: string;       // Default: 'en'
  loader: NgccI18nLoader;           // Required
  cache?: Map<string, Record<string, string>>; // Optional
  useBrowserLanguage?: boolean;    // Default: false
}
```

### provideNgccI18n(config: NgccI18nConfig)

Provider function for bootstrap configuration.

```typescript
provideNgccI18n({
  defaultLanguage: 'en',
  fallbackLanguage: 'en',
  loader: myLoader,
});
```

### HttpNgccI18nLoader

Built-in HTTP-based loader:

```typescript
const loader = new HttpNgccI18nLoader('/assets/i18n', '.json');
// Loads from: /assets/i18n/en.json, /assets/i18n/fr.json, etc.
```

## Advanced Usage

### Custom Loader Implementation

```typescript
import { Injectable } from '@angular/core';
import { NgccI18nLoader } from '@carbideui/components';

@Injectable({ providedIn: 'root' })
export class DatabaseI18nLoader implements NgccI18nLoader {
  constructor(private http: HttpClient) {}

  async load(language: string): Promise<Record<string, string>> {
    return this.http
      .get<Record<string, string>>(`/api/translations/${language}`)
      .toPromise()
      .then((data) => data || {});
  }
}
```

### Persistent Language Selection

```typescript
export class LanguageSwitcherComponent {
  constructor(private i18n: NgccI18nService) {}

  switchLanguage(lang: string) {
    this.i18n.setLanguage(lang).then(() => {
      localStorage.setItem('app-language', lang);
    });
  }
}
```

### Combining with Browser Language Detection

```typescript
bootstrapApplication(AppComponent, {
  providers: [
    provideNgccI18n({
      defaultLanguage: 'en',
      fallbackLanguage: 'en',
      loader: new HttpNgccI18nLoader('/assets/i18n'),
      useBrowserLanguage: true, // Auto-detect from navigator.language
    }),
  ],
});
```

## Parameter Interpolation

The service supports `{{paramName}}` syntax for parameter substitution:

```typescript
// Translation file (en.json)
{
  "welcome": "Welcome, {{name}}! You have {{count}} messages."
}

// In component
const message = i18n.t('welcome', { name: 'Alice', count: 5 });
// Result: "Welcome, Alice! You have 5 messages."
```

Parameter names are case-sensitive and support whitespace around them:
```html
{{ 'welcome' | ngccI18n: { name: 'Alice' } }}
<!-- {{name}}, {{ name }}, {{  name  }} all work -->
```

## Fallback Language Support

If a translation key is not found in the current language, the service automatically falls back to the fallback language:

```typescript
// If current language is 'fr' but translation is only in 'en':
i18n.t('missing_key'); // Returns translation from 'en' if available
```

If neither the current language nor the fallback language has the translation, the key itself is returned.

## SSR (Server-Side Rendering) Safety

NgccI18nService is fully SSR-safe:

- ✅ Uses `isPlatformBrowser()` to check execution environment
- ✅ No localStorage/sessionStorage access in the service
- ✅ All async operations are properly handled
- ✅ Works seamlessly with Angular Universal

## Caching

The service caches loaded translations to avoid redundant HTTP requests:

```typescript
// First call: loads from HTTP
await i18n.setLanguage('en');

// Second call: uses cache
await i18n.setLanguage('en'); // Instant (no HTTP request)

// Clear cache if needed
i18n.clearCache();
```

## Angular Compatibility

- ✅ Angular 20+
- ✅ Angular 21+
- ✅ Standalone APIs
- ✅ Signals
- ✅ Dependency Injection

## Performance Considerations

- **Lazy Loading**: Translations are only loaded when `setLanguage()` is called
- **Caching**: Loaded translations are cached in memory
- **Signals**: The pipe uses the `currentLanguage` signal for reactivity
- **Pure Pipe with Non-Pure Implementation**: Set to `pure: false` to subscribe to language changes

## Browser Support

Works in all modern browsers that support Angular 20+:
- Chrome/Edge 120+
- Firefox 120+
- Safari 16+

## License

MIT

## Contributing

Contributions are welcome! Please refer to the project's CONTRIBUTING.md file.
