import { Injectable, signal, effect } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class NgccTableSearchService<T = unknown> {
  readonly query = signal('');
  readonly searchResults = signal<T[]>([]);
  readonly loading = signal(false);

  endpoint?: string;

  constructor() {
    effect(() => {
      this.loading.set(true);
    });
  }

  /** Public API for static local filtering (used by NgccTable) */
  filterLocal(data: T[], columns: string[]): T[] {
    const q = this.query().trim().toLowerCase();
    if (!q) return data;

    return data.filter((row) =>
      columns.some((col) =>
        String((row as Record<string, unknown>)[col] ?? '')
          .toLowerCase()
          .includes(q),
      ),
    );
  }
}
