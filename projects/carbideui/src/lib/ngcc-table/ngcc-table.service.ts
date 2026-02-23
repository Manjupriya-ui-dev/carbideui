// projects/carbon-angular/src/lib/ngcc-table/table.service.ts
import { Injectable, signal } from '@angular/core';
import { NgccTableColumn } from './ngcc-table.types';

@Injectable({ providedIn: 'root' })
export class NgccTableService<T = unknown> {
  // central signals for a table instance — for a real multi-table library, this would be per-instance.
  readonly columns = signal<NgccTableColumn<T>[]>([]);
  readonly rows = signal<T[]>([]);
  readonly selectedRowIndexes = signal<Set<number>>(new Set());

  setColumns(cols: NgccTableColumn<T>[]): void {
    this.columns.set(cols);
  }
  setRows(rows: T[]): void {
    this.rows.set(rows);
    // clear selection on reset
    this.selectedRowIndexes.set(new Set());
  }
  toggleSelect(index: number): void {
    this.selectedRowIndexes.update((set) => {
      const next = new Set(set);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  }
  clearSelection(): void {
    this.selectedRowIndexes.set(new Set());
  }
}
