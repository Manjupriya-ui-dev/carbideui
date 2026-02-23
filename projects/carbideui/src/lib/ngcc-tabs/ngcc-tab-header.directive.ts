import { Directive, ElementRef, AfterViewInit, input, output, inject, effect } from '@angular/core';
import { NgccTab } from './ngcc-tab';

@Directive({
  selector: '[ngccTabHeader]',
  standalone: true,
  host: {
    '[attr.tabIndex]': 'active() ? 0 : null',
    '[attr.role]': '"tab"',
    '[attr.type]': '"button"',
    '[attr.aria-selected]': 'active() ? "true" : "false"',
    '[attr.aria-disabled]': 'disabled() ? "true" : null',
    '[attr.title]': 'title()',
    '[class.cds--tabs__nav-item]': 'true',
    '[class.cds--tabs__nav-link]': 'true',
    '[class.cds--tabs__nav-item--selected]': 'active()',
    '[class.cds--tabs__nav-item--disabled]': 'disabled()',
    '(click)': 'onClick()',
  },
})
export class NgccTabHeaderDirective implements AfterViewInit {
  private readonly host = inject(ElementRef<HTMLElement>);

  // ──────────────── Inputs ────────────────
  readonly cacheActive = input<boolean>(false);
  readonly paneTabIndex = input<number | null>(null);
  readonly active = input<boolean>(false);
  readonly disabled = input<boolean>(false);
  readonly paneReference = input<NgccTab | null>(null);
  readonly title = input<string | null>(null);

  // ──────────────── Outputs ────────────────
  readonly selected = output<void>();

  constructor() {
    // Keep paneReference cacheActive synced when cacheActive changes
    effect(() => {
      const paneRef = this.paneReference();
      const cache = this.cacheActive();
      if (paneRef) paneRef.cacheActive.set(cache);
    });

    // Keep paneReference tabIndex synced when paneTabIndex changes
    effect(() => {
      const paneRef = this.paneReference();
      const tabIndex = this.paneTabIndex();
      if (paneRef && tabIndex !== null) paneRef.tabIndex.set(tabIndex);
    });
  }

  ngAfterViewInit(): void {
    queueMicrotask(() => {
      if (!this.title()) {
        const nativeTitle = this.host.nativeElement.textContent?.trim() ?? '';
        this.title.bind(nativeTitle);
      }
    });
  }

  onClick(): void {
    if (this.disabled()) return;
    this.selectTab();
  }

  private selectTab(): void {
    this.focus();

    if (!this.disabled()) {
      this.selected.emit();
      this.active.bind(true);

      const paneRef = this.paneReference();
      if (paneRef) {
        paneRef.active.bind(true);
      }
    }
  }

  private focus(): void {
    this.host.nativeElement.focus();
  }
}
