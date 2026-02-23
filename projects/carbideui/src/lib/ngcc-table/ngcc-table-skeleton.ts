import {
  ChangeDetectionStrategy,
  Component,
  computed,
  signal,
  Input,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'ngcc-table-skeleton',
  standalone: true,
  imports: [CommonModule],
  template: `
    <table class="cds--data-table cds--data-table--compact" aria-label="Data table">
      <thead class="cds--data-table__head">
        <tr class="cds--data-table__row">
          @for (__ of columnArray(); track $index) {
            <th class="cds--table-column-checkbox">
              <span class="cds--skeleton__text"></span>
            </th>
          }
        </tr>
      </thead>
      <tbody class="cds--data-table__body">
        @for (_ of rowArray(); track $index) {
          <tr class="cds--data-table__row">
            @for (__ of columnArray(); track $index) {
              <td class="cds--data-table__cell">
                <span class="cds--skeleton__text"></span>
              </td>
            }
          </tr>
        }
      </tbody>
    </table>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'cds--data-table cds--skeleton ngcc-table-skeleton',
    'aria-hidden': 'true',
  },
})
export class NgccTableSkeleton implements OnChanges {
  /** number of placeholder columns */
  @Input() columns = 3;
  /** number of placeholder rows */
  @Input() rows = 5;
  /** skeleton display mode */
  @Input() mode: 'full' | 'rows' = 'full';

  // Internal state signals
  private readonly _columns = signal(3);
  private readonly _rows = signal(5);
  private readonly _mode = signal<'full' | 'rows'>('full');

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['columns']) this._columns.set(changes['columns'].currentValue ?? 3);
    if (changes['rows']) this._rows.set(changes['rows'].currentValue ?? 5);
    if (changes['mode']) this._mode.set(changes['mode'].currentValue ?? 'full');
  }

  /** computed arrays for template iteration (avoids recreating arrays on each change detection) */
  protected readonly columnArray = computed(() => Array(this._columns()).fill(0));
  protected readonly rowArray = computed(() => Array(this._rows()).fill(0));
}
