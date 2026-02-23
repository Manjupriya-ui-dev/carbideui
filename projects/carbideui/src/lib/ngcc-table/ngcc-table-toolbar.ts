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
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgccIcon } from '../ngcc-icons/ngcc-icon';
import { NgccTableSearchService } from './ngcc-table-search.service';
import { NgccButton } from '../ngcc-button/ngcc-button';
import { NgccInput } from '../../public-api';

@Component({
  selector: 'ngcc-table-toolbar',
  standalone: true,
  imports: [CommonModule, NgccIcon, NgccButton, NgccInput],
  templateUrl: './ngcc-table-toolbar.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'cds--table-toolbar',
    role: 'toolbar',
    '[attr.aria-label]': "'Table Toolbar'",
  },
})
export class NgccTableToolbar implements OnChanges {
  /* @Input properties */
  @Input() totalRows = 0;
  @Input() searchMode: 'local' | 'remote' = 'local';
  @Input() placeholder = 'Search';
  @Input() showActions = true;

  @Output() searchChanged = new EventEmitter<string>();

  // Internal signals
  private readonly _totalRows = signal<number>(0);
  private readonly _searchMode = signal<'local' | 'remote'>('local');
  private readonly _placeholder = signal('Search');
  private readonly _showActions = signal(true);

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['totalRows']) this._totalRows.set(changes['totalRows'].currentValue ?? 0);
    if (changes['searchMode']) this._searchMode.set(changes['searchMode'].currentValue ?? 'local');
    if (changes['placeholder'])
      this._placeholder.set(changes['placeholder'].currentValue ?? 'Search');
    if (changes['showActions']) this._showActions.set(changes['showActions'].currentValue ?? true);
  }

  // Accessor methods
  getTotalRows(): number {
    return this._totalRows();
  }
  getSearchMode(): 'local' | 'remote' {
    return this._searchMode();
  }
  getPlaceholder(): string {
    return this._placeholder();
  }
  getShowActions(): boolean {
    return this._showActions();
  }

  /* Internal Signals */
  protected readonly isExpanded = signal(false);
  protected readonly query = signal('');

  private readonly searchService = inject(NgccTableSearchService<unknown>);

  /* Computed state */
  protected readonly showClearButton = computed(() => this.query().length > 0);

  constructor() {
    // Sync local mode query directly to the search service
    effect(() => {
      if (this.getSearchMode() === 'local') {
        this.searchService.query.set(this.query());
      }
    });
  }

  /* Methods */
  protected toggleSearch(): void {
    this.isExpanded.update((v) => !v);
  }

  protected handleInput(value: string): void {
    this.query.set(value);
    this.searchChanged.emit(value);
  }

  protected clearSearch(): void {
    this.query.set('');
    this.searchChanged.emit('');
  }
}
