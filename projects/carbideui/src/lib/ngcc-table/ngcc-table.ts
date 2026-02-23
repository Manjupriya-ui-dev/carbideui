// projects/carbon-angular/src/lib/ngcc-table/ngcc-table.component.ts
import {
  ChangeDetectionStrategy,
  Component,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges,
  computed,
  effect,
  signal,
  OnInit,
  runInInjectionContext,
  inject,
  Injector,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgccTableColumn, NgccTableConfig } from './ngcc-table.types';
import { NgccTableService } from './ngcc-table.service';
import { NgccCheckbox } from '../ngcc-checkbox/ngcc-checkbox';
import { NgccIcon } from '../ngcc-icons/ngcc-icon';
import { NgccTableSearchService } from './ngcc-table-search.service';
import { NgccPagination } from '../ngcc-pagination/ngcc-pagination';
import { NgccSkeleton } from '../ngcc-skeleton/ngcc-skeleton';
import { NgccIconNameType } from '../ngcc-icons/icons';

@Component({
  selector: 'ngcc-table',
  standalone: true,
  imports: [CommonModule, NgccCheckbox, NgccIcon, NgccPagination, NgccSkeleton],
  templateUrl: './ngcc-table.html',
  styleUrls: ['./ngcc-table.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'cds--data-table-wrapper' },
})
export class NgccTable<T = unknown> implements OnInit, OnChanges {
  private readonly searchService = inject(NgccTableSearchService<T>);

  // @Input properties
  @Input() columns: NgccTableColumn<T>[] = [];
  @Input() rows: T[] = [];
  @Input() loading = false;
  @Input() config: NgccTableConfig = { pagination: true, pageSize: 10, rowSelection: 'multiple' };

  // Two-way binding for sortState (model)
  @Input() set sortState(val: { key: string; dir: 'asc' | 'desc' } | null) {
    this._sortState.set(val);
  }
  get sortState(): { key: string; dir: 'asc' | 'desc' } | null {
    return this._sortState();
  }
  @Output() sortStateChange = new EventEmitter<{ key: string; dir: 'asc' | 'desc' } | null>();

  // @Output events
  @Output() rowSelect = new EventEmitter<T[]>();
  @Output() searchChange = new EventEmitter<string>();

  // Internal state
  private readonly _sortState = signal<{ key: string; dir: 'asc' | 'desc' } | null>(null);
  private readonly _columns = signal<NgccTableColumn<T>[]>([]);
  private readonly _rows = signal<T[]>([]);
  private readonly _loading = signal(false);
  private readonly _config = signal<NgccTableConfig>({
    pagination: true,
    pageSize: 10,
    rowSelection: 'multiple',
  });

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['columns']) this._columns.set(changes['columns'].currentValue ?? []);
    if (changes['rows']) this._rows.set(changes['rows'].currentValue ?? []);
    if (changes['loading']) this._loading.set(changes['loading'].currentValue ?? false);
    if (changes['config'])
      this._config.set(
        changes['config'].currentValue ?? {
          pagination: true,
          pageSize: 10,
          rowSelection: 'multiple',
        },
      );
    if (changes['sortState']) this._sortState.set(changes['sortState'].currentValue ?? null);
  }

  // Template accessor methods
  getColumns(): NgccTableColumn<T>[] {
    return this._columns();
  }
  getRows(): T[] {
    return this._rows();
  }
  getLoading(): boolean {
    return this._loading();
  }
  getConfig(): NgccTableConfig {
    return this._config();
  }
  getSortStateValue(): { key: string; dir: 'asc' | 'desc' } | null {
    return this._sortState();
  }
  allowSelection(): boolean {
    const cfg = this.getConfig();
    return cfg.rowSelection !== 'none';
  }

  hoveredCol: string | null = null;

  private readonly injector = inject(Injector);
  private readonly service = inject(NgccTableService<T>);
  protected readonly searchExpanded = signal(false);

  protected readonly currentPage = signal(0);
  protected readonly searchQuery = signal('');
  protected readonly selected = signal<Set<number>>(new Set());

  // derived computed view of rows (sorting + filtering + pagination)
  protected readonly processedRows = computed(() => {
    const rows = (this.getRows() || []).slice();
    const sort = this.getSortStateValue();
    const q = this.searchService.query().trim().toLowerCase();

    let filtered = rows;
    if (q) {
      const keys = (this.getColumns() || []).map((c) => c.key);
      filtered = this.searchService.filterLocal(rows, keys);
    }
    // sorting
    if (sort) {
      filtered.sort((a, b) => {
        const av = (a as Record<string, unknown>)[sort.key];
        const bv = (b as Record<string, unknown>)[sort.key];
        if (av === null || av === undefined) {
          return bv === null || bv === undefined ? 0 : -1;
        }
        if (bv === null || bv === undefined) return 1;
        // numeric vs string fallback
        const aNum = Number(av);
        const bNum = Number(bv);
        const cmp =
          !isNaN(aNum) && !isNaN(bNum) ? aNum - bNum : String(av).localeCompare(String(bv));
        return sort.dir === 'asc' ? cmp : -cmp;
      });
    }
    // pagination
    const cfg = this.getConfig();
    if (cfg?.pagination) {
      const pageSize = cfg.pageSize ?? 10;
      const page = Math.max(0, this.currentPage());
      const start = page * pageSize;
      return filtered.slice(start, start + pageSize);
    }
    return filtered;
  });

  // expose total pages
  protected readonly totalPages = computed(() => {
    const cfg = this.getConfig();
    if (!cfg?.pagination) return 1;
    const total = (this.getRows() || []).length;
    return Math.max(1, Math.ceil(total / (cfg.pageSize ?? 10)));
  });

  constructor() {
    effect(() => {
      this.service.setColumns(this.getColumns());
      this.service.setRows(this.getRows());
    });
  }

  ngOnInit(): void {
    runInInjectionContext(this.injector, () => {
      effect(() => {
        // reset pagination when rows change
        this.currentPage.set(0);
      });
    });
  }

  protected isSelected(indexOnPage: number): boolean {
    // convert page index to absolute row index in the filtered+sorted set
    // For the starter, we track selection by absolute index from original rows
    return this.selected().has(indexOnPage);
  }

  protected toggleRowSelect(absIndex: number, _row: T): void {
    this.selected.update((s) => {
      const next = new Set(s);
      if (next.has(absIndex)) next.delete(absIndex);
      else next.add(absIndex);
      // emit selected data
      const selectedRows = Array.from(next).map((i) => (this.getRows() || [])[i]);
      this.rowSelect.emit(selectedRows);
      return next;
    });
  }

  protected isAllSelected(): boolean {
    const current = this.selected();
    const total = this.processedRows().length;
    return total > 0 && current.size === total;
  }

  protected toggleAllRowsSelected(): void {
    const totalRows = this.processedRows();
    this.selected.update((_selectedSet) => {
      const next = new Set<number>();
      if (!this.isAllSelected()) {
        // Select all visible rows
        for (let i = 0; i < totalRows.length; i++) {
          next.add(i);
        }
      }
      // Emit selected rows
      const selectedRows = Array.from(next).map((i) => totalRows[i]);
      this.rowSelect.emit(selectedRows);
      return next;
    });
  }
  protected readonly isIndeterminate = computed(() => {
    const sel = this.selected().size;
    const total = this.processedRows().length;
    return sel > 0 && sel < total;
  });

  protected goToPage(idx: number): void {
    const pages = this.totalPages();
    const next = Math.max(0, Math.min(idx, pages - 1));
    this.currentPage.set(next);
  }
  protected getSortIcon(colKey: string): NgccIconNameType {
    const cur = this.getSortStateValue();
    if (!cur || cur.key !== colKey) return 'sort_icon';
    return cur.dir === 'asc' ? 'arrow_up' : 'arrow_down';
  }

  getSortAria(colKey: string): 'ascending' | 'descending' | 'none' {
    if (this.getSortStateValue()?.key !== colKey) return 'none';
    return this.getSortStateValue()?.dir === 'asc' ? 'ascending' : 'descending';
  }

  getSortAriaLabel(colKey: string): string {
    const current = this.getSortStateValue();
    if (current?.key === colKey) {
      return current.dir === 'asc'
        ? `Sorted ascending by ${colKey}`
        : `Sorted descending by ${colKey}`;
    }
    return `Sort by ${colKey}`;
  }
  protected toggleSort(colKey: string, sortable?: boolean): void {
    if (!sortable) return;
    const cur = this.getSortStateValue();
    let newSort: { key: string; dir: 'asc' | 'desc' } | null;
    if (!cur || cur.key !== colKey) {
      newSort = { key: colKey, dir: 'asc' };
    } else if (cur.dir === 'asc') {
      newSort = { key: colKey, dir: 'desc' };
    } else {
      newSort = null;
    }
    this.sortState = newSort;
    this.sortStateChange.emit(newSort);
  }
  protected toggleSearchExpand(): void {
    this.searchExpanded.update((s) => !s);
  }
  protected handleSearchInput(value: string): void {
    const cfg = this.getConfig();
    if (cfg.search?.mode === 'dynamic') {
      this.searchChange.emit(value);
    } else {
      this.searchService.query.set(value);
    }
  }
  protected stringify(value: unknown): string {
    return value === null || value === undefined ? '' : String(value);
  }

  get loadingRows(): unknown[] {
    return Array(this.getConfig()?.pageSize || 0);
  }

  get columnPlaceholders(): unknown[] {
    return Array(this.getColumns()?.length + 1 || 0);
  }

  getColumnWidth(col: { width?: number | string }): string | null {
    if (!col.width) return null;

    if (typeof col.width === 'number') {
      return `${col.width}px`;
    }

    return col.width;
  }
}
