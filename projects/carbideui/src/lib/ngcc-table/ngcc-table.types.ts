// projects/carbon-angular/src/lib/ngcc-table/table.types.ts
export type SortDirection = 'asc' | 'desc';

export interface NgccTableColumn<_T = unknown> {
  key: string;
  header: string;
  sortable?: boolean;
  width?: string | number;
  align?: 'start' | 'center' | 'end';
  // allow template usage later (TemplateRef or component) - omitted for starter
}

export interface NgccTableConfig {
  pagination?: boolean;
  pageSize?: number;
  rowSelection?: 'single' | 'multiple' | 'none';
  search?: {
    enabled?: boolean;
    mode?: 'static' | 'dynamic'; // static filters locally, dynamic emits event
  };
}
