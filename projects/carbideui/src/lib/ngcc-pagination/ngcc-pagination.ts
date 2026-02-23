import {
  ChangeDetectionStrategy,
  Component,
  computed,
  signal,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgccIcon } from '../ngcc-icons/ngcc-icon';

@Component({
  selector: 'ngcc-pagination',
  standalone: true,
  imports: [CommonModule, NgccIcon],
  templateUrl: './ngcc-pagination.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'cds--pagination',
    role: 'navigation',
    '[attr.aria-label]': "'Pagination'",
  },
})
export class NgccPagination implements OnChanges {
  /** current page (1-based index) */
  @Input() page = 1;
  /** total items in the dataset */
  @Input() totalItems = 0;
  /** page size options */
  @Input() pageSizes: number[] = [10, 20, 50, 100];
  /** currently selected page size */
  @Input() pageSize = 10;
  /** optional looping behavior when using keyboard navigation */
  @Input() loopNavigation = false;

  /** outputs */
  @Output() pageChange = new EventEmitter<number>();
  @Output() pageSizeChange = new EventEmitter<number>();

  // Internal state signals
  private readonly _page = signal(1);
  private readonly _totalItems = signal(0);
  private readonly _pageSizes = signal<number[]>([10, 20, 50, 100]);
  private readonly _pageSize = signal(10);
  private readonly _loopNavigation = signal(false);

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['page']) this._page.set(changes['page'].currentValue ?? 1);
    if (changes['totalItems']) this._totalItems.set(changes['totalItems'].currentValue ?? 0);
    if (changes['pageSizes'])
      this._pageSizes.set(changes['pageSizes'].currentValue ?? [10, 20, 50, 100]);
    if (changes['pageSize']) this._pageSize.set(changes['pageSize'].currentValue ?? 10);
    if (changes['loopNavigation'])
      this._loopNavigation.set(changes['loopNavigation'].currentValue ?? false);
  }

  /** derived state */
  protected readonly totalPages = computed(() => {
    const total = this._totalItems();
    const size = this._pageSize();
    return size > 0 ? Math.max(1, Math.ceil(total / size)) : 1;
  });

  protected readonly startItem = computed(() => {
    const size = this._pageSize();
    const current = this._page();
    return totalZeroSafe(size * (current - 1) + 1, this._totalItems());
  });

  protected readonly endItem = computed(() => {
    const size = this._pageSize();
    const current = this._page();
    const end = size * current;
    return Math.min(end, this._totalItems());
  });

  protected readonly disablePrev = computed(() => this._page() <= 1);
  protected readonly disableNext = computed(() => this._page() >= this.totalPages());

  /** handlers */
  protected goToPage(newPage: number): void {
    const max = this.totalPages();
    const next = Math.max(1, Math.min(newPage, max));
    if (next !== this._page()) {
      this.pageChange.emit(next);
    }
  }

  protected handlePageSizeChange(event: Event): void {
    const value = Number((event.target as HTMLSelectElement).value);
    this.pageSizeChange.emit(value);
  }

  /** ✅ fixed version for keyboard navigation */
  protected onKeydown(event: KeyboardEvent): void {
    const current = this._page();
    const total = this.totalPages();

    if (event.key === 'ArrowLeft') {
      if (current > 1) {
        this.goToPage(current - 1);
      } else if (this._loopNavigation()) {
        this.pageChange.emit(total); // wrap to last page
      }
    }

    if (event.key === 'ArrowRight') {
      if (current < total) {
        this.goToPage(current + 1);
      } else if (this._loopNavigation()) {
        this.pageChange.emit(1); // wrap to first page
      }
    }
  }
}

/** Utility */
function totalZeroSafe(start: number, total: number): number {
  return total === 0 ? 0 : start;
}
