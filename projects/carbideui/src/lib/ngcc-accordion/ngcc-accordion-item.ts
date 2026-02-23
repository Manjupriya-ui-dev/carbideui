import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  Input,
  Output,
  EventEmitter,
  signal,
  inject,
  computed,
  ElementRef,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { NgccIcon } from '../ngcc-icons/ngcc-icon';
import { NgccAccordion } from './ngcc-accordion';
import { AccordionAlign, NGCC_ACCORDION_ALIGN } from './ngcc-accordion.types';

@Component({
  selector: 'ngcc-accordion-item',
  standalone: true,
  templateUrl: './ngcc-accordion-item.html',
  styleUrls: ['./ngcc-accordion-item.scss'],
  imports: [NgccIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': 'className()',
    role: 'listitem',
  },
})
export class NgccAccordionItem implements AfterViewInit, OnChanges {
  private readonly parent = inject(NgccAccordion, { optional: true });

  /** Alignment provided from parent */
  readonly align = inject<() => AccordionAlign>(NGCC_ACCORDION_ALIGN);

  /** Title */
  @Input() title: string = '';

  /** Default open state */
  @Input() defaultOpen = false;

  /** Disabled state */
  @Input() disabled = false;

  /** Emits when toggled */
  @Output() toggled = new EventEmitter<boolean>();

  /** Unique IDs */
  private readonly _uuid = crypto.randomUUID();
  readonly id = `ngcc-accordion-item-${this._uuid}`;
  readonly contentId = `ngcc-accordion-content-${this._uuid}`;

  // Internal state signals
  private readonly _title = signal(this.title);
  private readonly _disabled = signal(this.disabled);
  private readonly _defaultOpen = signal(this.defaultOpen);
  protected readonly isOpen = signal(this.defaultOpen);

  protected readonly ariaExpanded = computed(() => this.isOpen().toString());

  protected readonly className = computed(() =>
    this.isOpen() ? 'cds--accordion__item cds--accordion__item--active' : 'cds--accordion__item',
  );

  constructor(private el: ElementRef<HTMLElement>) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['title']) {
      this._title.set(changes['title'].currentValue ?? '');
    }
    if (changes['disabled']) {
      this._disabled.set(changes['disabled'].currentValue ?? false);
    }
    if (changes['defaultOpen']) {
      this._defaultOpen.set(changes['defaultOpen'].currentValue ?? false);
    }
  }

  ngAfterViewInit(): void {
    if (this.parent) {
      this.parent.toggleItem(this.id, this._defaultOpen());
      this.syncWithContainer(this.parent.getOpenItems());
    }
  }

  toggle(): void {
    if (this._disabled()) return;
    const next = !this.isOpen();
    this.isOpen.set(next);
    this.toggled.emit(next);
    if (this.parent) {
      this.parent.toggleItem(this.id, next);
    }
  }

  syncWithContainer(openIds: Set<string>): void {
    this.isOpen.set(openIds.has(this.id));
  }

  /** Keyboard navigation */
  onKeydown(event: KeyboardEvent): void {
    if (this._disabled()) return;

    const host = this.el.nativeElement;
    const items = Array.from(
      host.parentElement?.querySelectorAll<HTMLElement>('ngcc-accordion-item > button') ?? [],
    );
    const button = host.querySelector<HTMLElement>('button');
    const index = button ? items.indexOf(button) : -1;

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        items[(index + 1) % items.length]?.focus();
        break;
      case 'ArrowUp':
        event.preventDefault();
        items[(index - 1 + items.length) % items.length]?.focus();
        break;
      case 'Home':
        event.preventDefault();
        items[0]?.focus();
        break;
      case 'End':
        event.preventDefault();
        items[items.length - 1]?.focus();
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        this.toggle();
        break;
    }
  }

  /** IDs for accessibility */
  get buttonId(): string {
    return `${this.id}-button`;
  }
  get contentIdAttr(): string {
    return this.contentId;
  }

  // Expose internal signals for template (but as computed readonly)
  getTitle(): string {
    return this._title();
  }

  getDisabled(): boolean {
    return this._disabled();
  }
}
