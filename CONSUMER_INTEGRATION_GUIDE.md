# NGCC - Consumer App Integration Guide

**Based on Direct Library Analysis**

This guide provides step-by-step integration instructions for **NGCC** into an Angular v21+ consumer application, based on actual library architecture and structure.

---

## Library Overview

NGCC is a standalone, signals-based Angular component library featuring:

- **20+ Components** organized across Form, Data, Action, Feedback, Navigation, and Chart categories, including NgccBaseChart
- **Carbon Design System Integration** via `@carbon/styles` (v1.98.0+)
- **Standalone Architecture**: All components are standalone, tree-shakeable
- **Reactive State**: Built with Angular Signals and computed properties
- **ControlValueAccessor Support**: Form components support two-way binding and reactive forms
- **Service-Based Patterns**: Notification, Toast, and Theme services for global state management
- **WCAG 2.1 AA Accessibility**: Proper ARIA attributes and semantic HTML

---

## Prerequisites

- **Node.js**: v18+ (v20+ recommended)
- **Angular**: v20.0.0 or v21.0.0+
- **npm** or **yarn**
- Existing or new Angular v21 project

**Peer Dependencies** (automatically required):
- `@angular/common`
- `@angular/core`
- `@angular/forms` (for form components)
- `@angular/router` (optional, for router-aware components)
- `@carbon/styles` (mandatory)
- `@carbon/charts` (optional, only for chart components)

---

## Step 1: Create/Prepare Your Angular v21 Project

### Create a new Angular v21 project:

```bash
ng new my-consumer-app
cd my-consumer-app
```

### Or verify existing project version:

```bash
ng version
# Should show @angular/core: 21.x.x
```

---

## Step 2: Install NGCC and Dependencies

Install the core library with required peer dependencies:

```bash
npm install ngcc @angular/forms @carbon/styles
```

### Optional dependencies (install if needed):

```bash
# For chart components (NgccBarChart, NgccLineChart, NgccDonutChart, NgccGaugeChart)
npm install @carbon/charts

# If using router-based tabs navigation
npm install @angular/router
```

### Verify `package.json` shows:

```json
{
  "dependencies": {
    "@angular/common": "^21.0.0",
    "@angular/core": "^21.0.0",
    "@angular/forms": "^21.0.0",
    "@carbon/styles": "^1.98.0",
    "ngcc": "^0.0.0"
  }
}
```

---

## Step 3: Configure Carbon Design System Styles

### Import in Global `styles.scss` (Recommended)

Edit `src/styles.scss`:

```scss
// Load Carbon Design System base styles
@use '@carbon/styles/scss/config' with (
  $use-flexbox-grid: true,
  $font-path: '@ibm/plex'
);

@use '@carbon/styles';

```

**Important**: Styles MUST be configured before using any NGCC. Without this, components will render unstyled.

---

## Step 4: Understand Component Architecture

### Standalone Components

All NGCC are **standalone** - they're self-contained and don't require NgModule declarations:

```typescript
// Each component is standalone
@Component({
  selector: 'ngcc-button',
  standalone: true,  // ← This is key
  imports: [CommonModule, NgccIcon],
  ...
})
export class NgccButton { }
```

### ControlValueAccessor Support

Form components implement `ControlValueAccessor` for two-way binding:

- **NgccInput** - Text input with validation support
- **NgccCheckbox** - Checkbox with reactive forms support
- **NgccDropdown** - Single/multi-select with ControlValueAccessor
- **NgccDatepicker** - Date selection component
- **NgccTextarea** - Multi-line text input

### Service-Based Components

Some components rely on injected services:

- **NotificationService** - Manages global notification state
- **ToastService** - Manages global toast state
- **NgccColorThemeService** - Manages dynamic theming

---

## Step 5: Import and Use Components

NGCC are imported directly in component imports arrays. No global configuration needed per component.

### Example 1: Simple Button Component

```typescript
import { Component } from '@angular/core';
import { NgccButton } from 'ngcc';

@Component({
  selector: 'app-button-demo',
  standalone: true,
  imports: [NgccButton],
  template: `
    <ngcc-button
      label="Click Me"
      variant="primary"
      size="md"
    />
  `,
})
export class ButtonDemoComponent {}
```

### Example 2: Form Components with Two-Way Binding

Form components support `[(ngModel)]` and reactive forms:

```typescript
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgccInput, NgccCheckbox } from 'ngcc';

@Component({
  selector: 'app-form-demo',
  standalone: true,
  imports: [FormsModule, NgccInput, NgccCheckbox],
  template: `
    <div>
      <ngcc-input
        label="Email"
        type="email"
        placeholder="Enter email"
        [(value)]="email"
        [required]="true"
        [invalid]="email === ''"
        errorMessage="Email is required"
      />

      <ngcc-checkbox
        label="Subscribe"
        [(checked)]="subscribed"
      />
    </div>
  `,
})
export class FormDemoComponent {
  email = '';
  subscribed = false;
}
```

### Example 3: Dropdown Component (Single and Multi-Select)

```typescript
import { Component } from '@angular/core';
import { NgccDropdown } from 'ngcc';
import { NgccDropdownItem } from 'ngcc';

@Component({
  selector: 'app-dropdown-demo',
  standalone: true,
  imports: [NgccDropdown],
  template: `
    <ngcc-dropdown
      label="Select Country"
      [items]="countries"
      [multi]="false"
      placeholder="Choose..."
      [(value)]="selectedCountry"
    />
  `,
})
export class DropdownDemoComponent {
  selectedCountry: string | null = null;

  countries: NgccDropdownItem<string>[] = [
    { label: 'United States', value: 'us' },
    { label: 'Canada', value: 'ca' },
    { label: 'Mexico', value: 'mx' },
  ];
}
```

### Example 3.1: Chart Component (Bar Chart)

```typescript
import { Component } from '@angular/core';
import { NgccBarChart } from 'ngcc';

@Component({
  selector: 'app-bar-chart-demo',
  standalone: true,
  imports: [NgccBarChart],
  template: `
    <ngcc-charts
      type="bar"
      [data]="barChartData"
      [options]="chartOptions"
    />
  `,
})
export class BarChartDemoComponent {
  barChartData = {
    labels: ['Q1', 'Q2', 'Q3', 'Q4'],
    datasets: [{ label: 'Sales', data: [65, 59, 80, 72] }],
  };

  chartOptions = { height: 300, resizable: true };
}
```

### Example 4: Modal Component

```typescript
import { Component, signal } from '@angular/core';
import { NgccModal, NgccButton } from 'ngcc';

@Component({
  selector: 'app-modal-demo',
  standalone: true,
  imports: [NgccModal, NgccButton],
  template: `
    <ngcc-button label="Open Modal" (click)="isOpen.set(true)" />

    <ngcc-modal
      [open]="isOpen()"
      title="Confirm Action"
      primaryLabel="Confirm"
      secondaryLabel="Cancel"
      (submitted)="onConfirm()"
      (closed)="isOpen.set(false)"
    >
      <p>Are you sure you want to proceed?</p>
    </ngcc-modal>
  `,
})
export class ModalDemoComponent {
  isOpen = signal(false);

  onConfirm(): void {
    console.log('Confirmed');
    this.isOpen.set(false);
  }
}
```

### Example 5: Table Component

```typescript
import { Component } from '@angular/core';
import { NgccTable, NgccPagination } from 'ngcc';
import { TableHeader, TableRow } from 'ngcc';

@Component({
  selector: 'app-table-demo',
  standalone: true,
  imports: [NgccTable, NgccPagination],
  template: `
    <ngcc-table
      [headers]="headers"
      [rows]="rows"
      title="Users"
    />
  `,
})
export class TableDemoComponent {
  headers: TableHeader[] = [
    { key: 'id', label: 'ID' },
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
  ];

  rows: TableRow[] = [
    { id: 1, name: 'John Doe', email: 'john@example.com' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com' },
  ];
}
```

### Example 6: Tabs Component

```typescript
import { Component } from '@angular/core';
import { NgccTabs, NgccTab } from 'ngcc';

@Component({
  selector: 'app-tabs-demo',
  standalone: true,
  imports: [NgccTabs, NgccTab],
  template: `
    <ngcc-tabs>
      <ngcc-tab label="Overview">
        <p>Overview content here</p>
      </ngcc-tab>
      <ngcc-tab label="Details">
        <p>Details content here</p>
      </ngcc-tab>
      <ngcc-tab label="Settings">
        <p>Settings content here</p>
      </ngcc-tab>
    </ngcc-tabs>
  `,
})
export class TabsDemoComponent {}
```

### Example 7: Accordion Component

```typescript
import { Component } from '@angular/core';
import { NgccAccordion, NgccAccordionItem } from 'ngcc';

@Component({
  selector: 'app-accordion-demo',
  standalone: true,
  imports: [NgccAccordion, NgccAccordionItem],
  template: `
    <ngcc-accordion title="FAQ">
      <ngcc-accordion-item title="What is NGCC?">
        <p>NGCC is an Angular UI library based on Carbon Design System.</p>
      </ngcc-accordion-item>

      <ngcc-accordion-item title="Is it free?">
        <p>Yes, NGCC is open source and MIT licensed.</p>
      </ngcc-accordion-item>
    </ngcc-accordion>
  `,
})
export class AccordionDemoComponent {}
```

---

## Step 6: Work with Services

### Notification Service

The `NotificationService` manages global notifications without requiring component template declarations:

```typescript
import { Component, inject } from '@angular/core';
import { NgccButton } from 'ngcc';
import { NotificationService } from 'ngcc';

@Component({
  selector: 'app-notification-demo',
  standalone: true,
  imports: [NgccButton],
  template: `
    <ngcc-button
      label="Show Notification"
      (click)="showNotification()"
    />
  `,
})
export class NotificationDemoComponent {
  private notificationService = inject(NotificationService);

  showNotification(): void {
    this.notificationService.show({
      type: 'success',
      title: 'Success!',
      description: 'Operation completed successfully',
      timeout: 5000,
    });
  }
}
```

**Notification Types**: `'success'` | `'error'` | `'warning'` | `'info'`

### Toast Service

Similar to notifications but typically used for transient messages:

```typescript
import { Component, inject } from '@angular/core';
import { NgccButton } from 'ngcc';
import { ToastService } from 'ngcc';

@Component({
  selector: 'app-toast-demo',
  standalone: true,
  imports: [NgccButton],
  template: `
    <ngcc-button 
      label="Show Toast" 
      (click)="showToast()"
    />
  `,
})
export class ToastDemoComponent {
  private toastService = inject(ToastService);

  showToast(): void {
    this.toastService.show({
      type: 'info',
      title: 'Information',
      timeout: 3000,
    });
  }
}
```

### Color Theme Service

Manage dynamic theming at runtime:

```typescript
import { Component, inject } from '@angular/core';
import { NgccButton } from 'ngcc';
import { NgccColorThemeService } from 'ngcc';

@Component({
  selector: 'app-theme-demo',
  standalone: true,
  imports: [NgccButton],
  template: `
    <div>
      <ngcc-button 
        label="Light Theme" 
        (click)="setTheme('white')"
      />
      <ngcc-button 
        label="Dark Theme (g90)" 
        (click)="setTheme('g90')"
      />
    </div>
  `,
})
export class ThemeDemoComponent {
  private themeService = inject(NgccColorThemeService);

  setTheme(theme: 'white' | 'g10' | 'g90' | 'g100'): void {
    this.themeService.baseTheme.set(theme);
  }
}
```

**Available Themes**: `'white'` (default) | `'g10'` | `'g90'` | `'g100'`

---

## Step 7: Complete Application Example

### `src/main.ts`

```typescript
import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';

bootstrapApplication(AppComponent).catch((err) => console.error(err));
```

### `src/app/app.component.ts`

```typescript
import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  NgccButton,
  NgccInput,
  NgccCheckbox,
  NgccDropdown,
  NgccTabs,
  NgccTab,
  NgccModal,
  NgccDropdownItem,
} from 'ngcc';
import { NotificationService } from 'ngcc';

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  country: string | null;
  subscribe: boolean;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NgccButton,
    NgccInput,
    NgccCheckbox,
    NgccDropdown,
    NgccTabs,
    NgccTab,
    NgccModal,
  ],
  template: `
    <div class="app-container">
      <header class="app-header">
        <h1>NGCC Demo</h1>
        <p>Angular v21 Integration Example</p>
      </header>

      <main class="app-content">
        <ngcc-tabs>
          <ngcc-tab label="Registration">
            <form (ngSubmit)="onSubmit()" class="form">
              <ngcc-input
                label="First Name"
                placeholder="Enter first name"
                [(value)]="form.firstName"
                [required]="true"
              />

              <ngcc-input
                label="Last Name"
                placeholder="Enter last name"
                [(value)]="form.lastName"
                [required]="true"
              />

              <ngcc-input
                label="Email"
                type="email"
                placeholder="Enter email"
                [(value)]="form.email"
                [required]="true"
                [invalid]="isEmailInvalid()"
                errorMessage="Please enter a valid email"
              />

              <ngcc-dropdown
                label="Country"
                [items]="countries"
                placeholder="Select country"
                [(value)]="form.country"
              />

              <ngcc-checkbox
                label="Subscribe to newsletter"
                [(checked)]="form.subscribe"
              />

              <div class="form-actions">
                <ngcc-button
                  label="Submit"
                  variant="primary"
                  [disabled]="!isFormValid()"
                  (click)="onSubmit()"
                />
                <ngcc-button
                  label="Reset"
                  variant="secondary"
                  (click)="resetForm()"
                />
              </div>
            </form>
          </ngcc-tab>

          <ngcc-tab label="Help">
            <div class="help-content">
              <h3>About NGCC</h3>
              <p>This is a demo of NGCC - an Angular component library based on Carbon Design System.</p>
              <p><strong>Features:</strong></p>
              <ul>
                <li>Standalone components</li>
                <li>Signal-based reactivity</li>
                <li>WCAG 2.1 AA accessible</li>
                <li>Tree-shakeable</li>
              </ul>
            </div>
          </ngcc-tab>
        </ngcc-tabs>
      </main>

      <!-- Modal for success confirmation -->
      <ngcc-modal
        [open]="isModalOpen()"
        title="Success"
        primaryLabel="Close"
        [closeOnOverlayClick]="true"
        (submitted)="isModalOpen.set(false)"
        (closed)="isModalOpen.set(false)"
      >
        <p>Form submitted successfully!</p>
        <p><strong>Name:</strong> {{ form.firstName }} {{ form.lastName }}</p>
        <p><strong>Email:</strong> {{ form.email }}</p>
      </ngcc-modal>
    </div>
  `,
  styles: [`
    .app-container {
      max-width: 1000px;
      margin: 0 auto;
      padding: 2rem;
    }

    .app-header {
      text-align: center;
      margin-bottom: 2rem;
      border-bottom: 1px solid #e0e0e0;
      padding-bottom: 1rem;
    }

    .app-header h1 {
      margin: 0;
      font-size: 2rem;
      color: #161616;
    }

    .app-header p {
      margin: 0.5rem 0 0 0;
      color: #525252;
    }

    .app-content {
      margin: 2rem 0;
    }

    .form {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
      padding: 2rem;
      background: #f4f4f4;
      border-radius: 4px;
    }

    .form-actions {
      display: flex;
      gap: 1rem;
      margin-top: 1rem;
    }

    .help-content {
      padding: 2rem;
      background: #f4f4f4;
      border-radius: 4px;
    }

    .help-content h3 {
      margin-top: 0;
      color: #161616;
    }

    .help-content ul {
      margin: 1rem 0;
      padding-left: 2rem;
    }

    .help-content li {
      margin: 0.5rem 0;
      color: #525252;
    }
  `],
})
export class AppComponent {
  private notificationService = inject(NotificationService);

  form: FormData = {
    firstName: '',
    lastName: '',
    email: '',
    country: null,
    subscribe: false,
  };

  isModalOpen = signal(false);

  countries: NgccDropdownItem<string>[] = [
    { label: 'United States', value: 'us' },
    { label: 'Canada', value: 'ca' },
    { label: 'United Kingdom', value: 'uk' },
    { label: 'Australia', value: 'au' },
  ];

  isFormValid(): boolean {
    return (
      this.form.firstName.trim() !== '' &&
      this.form.lastName.trim() !== '' &&
      this.isEmailValid()
    );
  }

  isEmailValid(): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(this.form.email);
  }

  isEmailInvalid(): boolean {
    return this.form.email.length > 0 && !this.isEmailValid();
  }

  onSubmit(): void {
    if (this.isFormValid()) {
      console.log('Form submitted:', this.form);
      this.notificationService.show({
        type: 'success',
        title: 'Registration Successful',
        description: `Welcome ${this.form.firstName}!`,
      });
      this.isModalOpen.set(true);
    }
  }

  resetForm(): void {
    this.form = {
      firstName: '',
      lastName: '',
      email: '',
      country: null,
      subscribe: false,
    };
    this.notificationService.show({
      type: 'info',
      title: 'Form Reset',
      description: 'All fields have been cleared',
    });
  }
}
```

### `src/styles.scss`

```scss
@use '@carbon/styles';

// Global defaults
* {
  box-sizing: border-box;
}

html,
body {
  height: 100%;
  width: 100%;
  margin: 0;
  padding: 0;
}

body {
  font-family: 'IBM Plex Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background-color: #ffffff;
  color: #161616;
  font-size: 14px;
  line-height: 1.5;
}

h1, h2, h3, h4, h5, h6 {
  margin: 1rem 0 0.5rem 0;
}

p {
  margin: 0.5rem 0;
}
```

---

## Step 8: Available Components Reference

### Form Components

| Component | Imports | Features |
|-----------|---------|----------|
| **NgccInput** | `NgccInput` | Text input with validation, ControlValueAccessor |
| **NgccTextarea** | `NgccTextarea` | Multi-line text input |
| **NgccCheckbox** | `NgccCheckbox` | Checkbox with reactive forms support |
| **NgccDropdown** | `NgccDropdown, NgccDropdownItem` | Single/multi-select, searchable |
| **NgccDatepicker** | `NgccDatepicker` | Date selection component |

### Action Components

| Component | Imports | Variants |
|-----------|---------|----------|
| **NgccButton** | `NgccButton` | primary, secondary, tertiary, ghost, danger |

### Data Components

| Component | Imports | Features |
|-----------|---------|----------|
| **NgccTable** | `NgccTable` | Data display, sortable headers |
| **NgccPagination** | `NgccPagination` | Page navigation |

### Feedback Components

| Component | Imports | Usage |
|-----------|---------|-------|
| **NgccNotification** | `NgccNotification, NotificationService` | Service-driven notifications |
| **NgccToast** | `NgccToast, ToastService` | Transient toast messages |
| **NgccModal** | `NgccModal` | Modal dialogs |
| **NgccTooltip** | `NgccTooltip` | Tooltip directives |
| **NgccSkeleton** | `NgccSkeleton` | Loading placeholder |

### Navigation Components

| Component | Imports | Features |
|-----------|---------|----------|
| **NgccTabs** | `NgccTabs, NgccTab` | Tabbed content with routing support |
| **NgccAccordion** | `NgccAccordion, NgccAccordionItem` | Collapsible sections |

### Chart Components (Requires @carbon/charts)

| Component | Imports |
|-----------|---------|
| **NgccBarChart** | `NgccBarChart` |
| **NgccLineChart** | `NgccLineChart` |
| **NgccDonutChart** | `NgccDonutChart` |
| **NgccGaugeChart** | `NgccGaugeChart` |

### Theming Components

| Export | Purpose |
|--------|---------|
| **NgccColorThemeService** | Dynamic theme management (white, g10, g90, g100) |
| **NgccColorThemeSwitcher** | Pre-built theme switcher component |

---

## Step 9: Run Your Application

```bash
# Development server
ng serve

# Specific port
ng serve --port 4201

# Navigate to
# http://localhost:4200
```

---

## Step 10: Build for Production

```bash
# Build optimized bundle
ng build --configuration production

# Output in dist/
# Ready for deployment
```

---

## Key Architectural Insights

### Signals-Based Reactivity

Components use Angular Signals for fine-grained change detection:

```typescript
// Inside NgccButton
private readonly _label = signal('');
private readonly _disabled = signal(false);

readonly classes = computed(() => {
  // Recalculates only when signals change
  return [...];
});
```

### Form Integration Pattern

Form components implement `ControlValueAccessor`:

```typescript
// Inside NgccInput
export class NgccInput implements ControlValueAccessor, OnChanges {
  // Write value from form control
  writeValue(obj: any): void { }
  
  // Register onChange callback
  registerOnChange(fn: any): void { }
  
  // Register onTouched callback
  registerOnTouched(fn: any): void { }
}
```

### Service-Based State Management

Services manage global UI state without template pollution:

```typescript
// NotificationService uses signals internally
@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly _notifications = signal<NgccNotificationConfig[]>([]);
  readonly notifications = computed(() => this._notifications());
}
```

---

## Troubleshooting

### Styles Not Applied

**Problem**: Components render but lack styling

**Solution**: Ensure `@carbon/styles` is imported in `src/styles.scss`:

```scss
@use '@carbon/styles'; // Must be first import
```

### ControlValueAccessor Not Working

**Problem**: Two-way binding `[(value)]` doesn't update

**Solution**: Ensure component uses `FormsModule`:

```typescript
import { FormsModule } from '@angular/forms';

@Component({
  imports: [FormsModule, NgccInput],
})
```

### Service Injection Error

**Problem**: `NullInjectorError: No provider for NotificationService`

**Solution**: Service uses `providedIn: 'root'`. If bootstrapping without `bootstrapApplication`, ensure ApplicationConfig:

```typescript
bootstrapApplication(AppComponent).catch(err => console.error(err));
```

### Theme Not Changing

**Problem**: `setTheme()` doesn't apply new theme

**Solution**: Use `signal.set()` to trigger reactivity:

```typescript
themeService.baseTheme.set('g90');  // Correct
themeService.baseTheme = 'g90';     // Wrong
```

---

## Best Practices

1. **Import Only What You Use**: Tree-shake unused components

   ```typescript
   // ✅ Good
   import { NgccButton } from 'ngcc';
   
   // ❌ Wasteful
   import * as NGCC from 'ngcc';
   ```

2. **Use Signals for Local State**:

   ```typescript
   isOpen = signal(false);
   count = signal(0);
   ```

3. **Leverage Computed Properties**:

   ```typescript
   isValid = computed(() => this.form().email !== '');
   ```

4. **Inject Services with `inject()`**:

   ```typescript
   private notificationService = inject(NotificationService);
   ```

5. **WCAG Compliance**: Always provide `ariaLabel` or `label`:

   ```typescript
   <ngcc-button 
     ariaLabel="Submit form"
     variant="primary"
   />
   ```

6. **Type Safety**: Use provided types from library:

   ```typescript
   import { NgccDropdownItem, NgccButtonVariant } from 'ngcc';
   ```

---

## Next Steps

1. ✅ Set up Angular v21 project
2. ✅ Install NGCC and dependencies
3. ✅ Configure Carbon Design System styles
4. ✅ Import components in your app
5. ✅ Use services for global state (Notifications, Toasts, Theming)
6. ✅ Build and deploy

Happy building! 🚀
