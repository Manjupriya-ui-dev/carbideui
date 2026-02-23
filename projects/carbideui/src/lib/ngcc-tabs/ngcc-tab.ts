import {
  ChangeDetectionStrategy,
  Component,
  TemplateRef,
  computed,
  input,
  output,
  signal,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';

/**
 * NgccTabComponent
 * -----------------------
 * Represents an individual tab inside a Tabs container.
 * Supports string or template headings, cached rendering, and emits when selected.
 *
 * Example:
 * ```html
 * <ngcc-tab heading="Overview">
 *   Tab 1 content
 * </ngcc-tab>
 * ```
 *
 * With a custom heading:
 * ```html
 * <ng-template #customHeading>
 *   <fa-icon icon="user"></fa-icon>
 *   Profile
 * </ng-template>
 *
 * <ngcc-tab [heading]="customHeading">
 *   Profile details...
 * </ngcc-tab>
 * ```
 */
@Component({
  selector: 'ngcc-tab',
  standalone: true,
  imports: [NgTemplateOutlet],
  templateUrl: './ngcc-tab.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'cds--tab',
    role: 'presentation',
  },
})
export class NgccTab {
  private static counter = 0;

  // -----------------------------
  // Inputs (Signal-based)
  // -----------------------------
  readonly heading = input<string | TemplateRef<unknown>>('');
  readonly title = input<string | null>(null);
  readonly context = input<unknown>(null);
  readonly disabled = input<boolean>(false);
  readonly tabIndex = signal<number | null>(0);
  readonly id = input<string>(`ngcc-tab-${NgccTab.counter++}`);
  readonly cacheActive = signal<boolean>(false);
  readonly tabContent = input<TemplateRef<unknown> | null>(null);
  readonly templateContext = input<unknown>(null);

  readonly active = signal<boolean>(false);

  // add:
  setActive(value: boolean): void {
    this.active.set(value);
  }
  // -----------------------------
  // Outputs
  // -----------------------------
  readonly selected = output<void>();

  // -----------------------------
  // Derived state
  // -----------------------------
  readonly headingIsTemplate = computed(() => this.heading() instanceof TemplateRef);

  // -----------------------------
  // Methods
  // -----------------------------
  doSelect(): void {
    this.selected.emit();
  }

  protected shouldRender(): boolean {
    return this.active() || this.cacheActive();
  }

  protected isTemplate(value: unknown): value is TemplateRef<unknown> {
    return value instanceof TemplateRef;
  }
}
