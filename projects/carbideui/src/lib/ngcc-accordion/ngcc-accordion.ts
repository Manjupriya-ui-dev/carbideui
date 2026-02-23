import {
  AfterContentInit,
  ChangeDetectionStrategy,
  Component,
  contentChildren,
  Input,
  computed,
  signal,
  Provider,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { NgccAccordionItem } from './ngcc-accordion-item';
import { AccordionAlign, AccordionSize, NGCC_ACCORDION_ALIGN } from './ngcc-accordion.types';

@Component({
  selector: 'ngcc-accordion',
  standalone: true,
  template: `<ng-content />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': 'containerClass()',
    role: 'list',
  },
  providers: [
    {
      provide: NGCC_ACCORDION_ALIGN,
      useFactory: (comp: NgccAccordion) => () => comp.getAlign(),
      deps: [NgccAccordion],
    } as Provider,
  ],
})
export class NgccAccordion implements AfterContentInit, OnChanges {
  /** Allow multiple items to stay open at once */
  @Input() multi = true;

  protected readonly items = contentChildren(NgccAccordionItem);

  /** alignment and size as Input decorators */
  @Input() align: AccordionAlign = 'start';
  @Input() size: AccordionSize = 'md';

  // Internal state (private signals)
  private readonly _multi = signal(this.multi);
  private readonly _align = signal<AccordionAlign>(this.align);
  private readonly _size = signal<AccordionSize>(this.size);
  private readonly openItems = signal<Set<string>>(new Set());

  protected readonly containerClass = computed(() =>
    [
      'cds--accordion',
      `cds--accordion--${this._align()}`,
      `cds--accordion--${this._size()}`,
      `cds--layout--size-${this._size()}`,
    ].join(' '),
  );

  /** array view of open ids */
  readonly openItemIds = computed(() => Array.from(this.openItems()));

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['multi']) {
      this._multi.set(changes['multi'].currentValue ?? true);
    }
    if (changes['align']) {
      this._align.set(changes['align'].currentValue ?? 'start');
    }
    if (changes['size']) {
      this._size.set(changes['size'].currentValue ?? 'md');
    }
  }

  ngAfterContentInit(): void {
    this.items().forEach((item) => {
      item.syncWithContainer(this.openItems());
    });
  }

  // Expose current align value as a callable for injection
  getAlign(): AccordionAlign {
    return this._align();
  }

  /** Get the current set of open item IDs (for child components) */
  getOpenItems(): Set<string> {
    return this.openItems();
  }

  toggleItem(id: string, shouldOpen: boolean): void {
    this.openItems.update((set) => {
      const next = new Set(set);

      if (this._multi()) {
        shouldOpen ? next.add(id) : next.delete(id);
      } else {
        next.clear();
        if (shouldOpen) next.add(id);
      }

      return next;
    });

    const openSet = this.openItems();
    this.items().forEach((item) => item.syncWithContainer(openSet));
  }

  /** Programmatic API */
  openItem(id: string): void {
    this.toggleItem(id, true);
  }
  closeItem(id: string): void {
    this.toggleItem(id, false);
  }
}
