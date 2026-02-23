import {
  Component,
  ChangeDetectionStrategy,
  ElementRef,
  Renderer2,
  TemplateRef,
  ViewChild,
  input,
  computed,
  inject,
  ChangeDetectorRef,
} from '@angular/core';
import { NgccTabType } from './ngcc-tabs.types';

@Component({
  selector: 'ngcc-base-tab-header',
  standalone: true,
  template: '',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'cds--tabs',
    '[class.cds--tabs--contained]': 'type() === "contained"',
  },
})
export class NgccBaseTabHeader {
  // =============================
  // 🔹 Inputs (converted to signals)
  // =============================
  // Inputs (exposed as InputSignals so parent components can bind)
  readonly cacheActive = input<boolean>(false);
  readonly followFocus = input<boolean | undefined>(undefined);
  // Support attribute forms: `aria-label` and `aria-labelledby`
  readonly ariaLabel = input<string | undefined>(undefined);
  readonly ariaLabelledBy = input<string | undefined>(undefined);
  readonly contentBefore = input<TemplateRef<unknown> | null>(null);
  readonly contentAfter = input<TemplateRef<unknown> | null>(null);
  readonly type = input<NgccTabType>('line');

  // =============================
  // 🔹 ViewChild
  // =============================
  @ViewChild('tabList', { static: true })
  headerContainer!: ElementRef<HTMLElement>;

  // =============================
  // 🔹 Local state
  // =============================
  currentSelectedTab = 0;
  readonly OVERFLOW_BUTTON_OFFSET = 44;
  readonly longPressMultiplier = 3;
  readonly clickMultiplier = 1.5;

  protected longPressInterval: ReturnType<typeof setTimeout> | null = null;
  protected tickInterval: ReturnType<typeof setInterval> | null = null;

  // =============================
  // 🔹 Injected services (modern API)
  // =============================
  protected readonly elementRef = inject(ElementRef);
  protected readonly changeDetectorRef = inject(ChangeDetectorRef);
  protected readonly renderer = inject(Renderer2);

  // =============================
  // 🔹 Computed states
  // =============================
  readonly hasHorizontalOverflow = computed(() => {
    const tabList = this.headerContainer?.nativeElement;
    return !!tabList && tabList.scrollWidth > tabList.clientWidth;
  });

  readonly leftOverflowNavButtonHidden = computed(() => {
    const tabList = this.headerContainer?.nativeElement;
    return !this.hasHorizontalOverflow() || !tabList || tabList.scrollLeft === 0;
  });

  readonly rightOverflowNavButtonHidden = computed(() => {
    const tabList = this.headerContainer?.nativeElement;
    return (
      !this.hasHorizontalOverflow() ||
      tabList.scrollLeft + tabList.clientWidth === tabList.scrollWidth
    );
  });

  // =============================
  // 🔹 Scroll + Overflow Handling
  // =============================
  handleScroll(): void {
    this.changeDetectorRef.markForCheck();
  }

  handleOverflowNavClick(direction: number, numOftabs = 0): void {
    const tabList = this.headerContainer.nativeElement;
    const { clientWidth, scrollLeft, scrollWidth } = tabList;

    if (direction > 0) {
      tabList.scrollLeft = Math.min(
        scrollLeft + (scrollWidth / numOftabs) * this.clickMultiplier,
        scrollWidth - clientWidth,
      );
    } else if (direction < 0) {
      tabList.scrollLeft = Math.max(
        scrollLeft - (scrollWidth / numOftabs) * this.clickMultiplier,
        0,
      );
    }
  }

  handleOverflowNavMouseDown(direction: number): void {
    const tabList = this.headerContainer.nativeElement;

    this.longPressInterval = setTimeout(() => {
      this.renderer.setStyle(tabList, 'scroll-behavior', 'auto');

      this.tickInterval = setInterval(() => {
        tabList.scrollLeft += direction * this.longPressMultiplier;

        // Check if we reached the start or end
        const atStart = tabList.scrollLeft <= 0;
        const atEnd = tabList.scrollLeft + tabList.clientWidth >= tabList.scrollWidth;

        if (atStart || atEnd) {
          if (this.tickInterval) clearInterval(this.tickInterval);
          this.handleOverflowNavMouseUp();
        }
      });
    }, 500);
  }

  handleOverflowNavMouseUp(): void {
    if (this.tickInterval) {
      clearInterval(this.tickInterval);
      this.tickInterval = null;
    }
    if (this.longPressInterval) {
      clearTimeout(this.longPressInterval);
      this.longPressInterval = null;
    }

    this.renderer.setStyle(this.headerContainer.nativeElement, 'scroll-behavior', 'smooth');
  }
  onTabFocus(index: number): void {
    this.currentSelectedTab = index;
  }
}
