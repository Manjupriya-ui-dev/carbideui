import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { CommonModule } from '@angular/common';
import { NgccTable } from './ngcc-table';
import type { NgccTableColumn } from './ngcc-table.types';
import { NgccTableToolbar } from './ngcc-table-toolbar';
import { NgccTableSkeleton } from './ngcc-table-skeleton';

const meta: Meta<NgccTable> = {
  title: 'Components/Table',
  component: NgccTable,
  tags: ['autodocs'],
  decorators: [
    moduleMetadata({
      imports: [CommonModule, NgccTable, NgccTableToolbar, NgccTableSkeleton],
    }),
  ],
  argTypes: {
    loading: { control: 'boolean' },
    // columns/rows are complex objects; keep them editable as JSON
    columns: { control: 'object' },
    rows: { control: 'object' },
    config: { control: 'object' },
  },
};
export default meta;

type Story = StoryObj<NgccTable>;

/* ---------------------
Shared sample data
--------------------- */
const sampleColumns: NgccTableColumn[] = [
  { key: 'name', header: 'Name', sortable: true },
  { key: 'role', header: 'Role', sortable: true },
  { key: 'location', header: 'Location' },
];

const sampleRows = [
  { name: 'Ava', role: 'Engineer', location: 'Berlin' },
  { name: 'Kai', role: 'Designer', location: 'Toronto' },
  { name: 'Ravi', role: 'Product', location: 'Bengaluru' },
  { name: 'Maya', role: 'Data', location: 'London' },
];

/* --- 1. Default table --- */
export const Default: Story = {
  args: {
    columns: sampleColumns,
    rows: sampleRows,
    loading: false,
    config: { pagination: false, pageSize: 10, rowSelection: 'none' },
  },
  render: (args) => ({
    props: args,
    template: `       <div style="padding: 20px; max-width: 900px;">         <ngcc-table           [columns]="columns"           [rows]="rows"           [loading]="loading"           [config]="config"         ></ngcc-table>       </div>
    `,
  }),
};

/* --- 2. Sortable (click headers to sort) --- */
export const Sortable: Story = {
  args: {
    columns: sampleColumns,
    rows: sampleRows,
    loading: false,
    config: { pagination: false, pageSize: 10, rowSelection: 'none' },
  },
  render: (args) => ({
    props: args,
    template: `       <div style="padding: 20px;">         <p style="margin-bottom:8px;">Click the column headers (Name / Role) to toggle sorting.</p>         <ngcc-table           [columns]="columns"           [rows]="rows"           [loading]="loading"           [config]="config"         ></ngcc-table>       </div>
    `,
  }),
};

/* --- 3. Selectable rows (checkbox + multi-select) --- */
export const Selectable: Story = {
  args: {
    columns: sampleColumns,
    rows: sampleRows,
    loading: false,
    config: { pagination: false, pageSize: 10, rowSelection: 'multiple' },
  },
  render: (args) => ({
    props: {
      ...args,
      onRowSelect: (selected: any[]) => {
        console.log('selected', selected);
      },
    },
    template: `
      <div style="padding: 20px;">
        <p style="margin-bottom:8px;">Row selection enabled (click row or checkbox).</p>
        <ngcc-table
          [columns]="columns"
          [rows]="rows"
          [loading]="loading"
          [config]="config"
          (rowSelect)="onRowSelect($event)"
        ></ngcc-table>
      </div>
    `,
  }),
};

export const Toolbar: Story = {
  args: {
    columns: sampleColumns,
    rows: sampleRows,
    loading: false,
    config: { pagination: false, pageSize: 10, rowSelection: 'multiple' },
  },
  render: (args) => ({
    props: {
      ...args,
      onSearch: (query: string) => {
        console.log('Search triggered:', query);
      },
    },
    template: `
      <div style="padding: 20px;">
        <ngcc-table [columns]="columns" [rows]="rows">
          <ngcc-table-toolbar
            [totalRows]="rows.length"
            (searchChanged)="onSearch($event)"
          ></ngcc-table-toolbar>
        </ngcc-table>

        <br><br>

        <ngcc-table-toolbar
          [totalRows]="rows.length"
          (searchChanged)="onSearch($event)"
        ></ngcc-table-toolbar>

        <ngcc-table [columns]="columns" [rows]="rows"></ngcc-table>
      </div>
    `,
  }),
};

/* --- 4. Loading / Skeleton state --- */
export const SkeletonStates: Story = {
  args: {
    columns: sampleColumns,
    rows: [],
    loading: true,
    config: { pagination: false, pageSize: 5, rowSelection: 'none' },
  },
  render: (args) => ({
    props: args,
    template: `
      <div style="padding: 20px;">
      Full Table:
  <br>
  <br>
         <ngcc-table-skeleton
    [columns]="columns.length || 3"
    [rows]="config?.pageSize || 5"
    mode="full"
  ></ngcc-table-skeleton>
   </div>
    `,
  }),
};

/* --- 5. Pagination (client-side) --- */
export const Pagination: Story = {
  args: {
    columns: sampleColumns,
    rows: sampleRows,
    loading: false,
    config: { pagination: true, pageSize: 2, rowSelection: 'multiple' },
  },
  render: (args) => ({
    props: args,
    template: `       <div style="padding: 20px;">         <p style="margin-bottom:8px;">Pagination enabled — page size 2.</p>         <ngcc-table           [columns]="columns"           [rows]="rows"           [loading]="loading"           [config]="config"         ></ngcc-table>       </div>
    `,
  }),
};

/* --- 6. Static search --- */
export const StaticSearch: Story = {
  args: {
    columns: sampleColumns,
    rows: sampleRows,
    loading: false,
    config: {
      pagination: false,
      pageSize: 10,
      rowSelection: 'none',
      search: { enabled: true, mode: 'static' },
    },
  },
  render: (args) => ({
    props: {
      ...args,
      onSearch: (term: string) => {
        console.log('Static search term:', term);
      },
    },
    template: `
      <div style="padding: 20px;">
        <ngcc-table-toolbar
          [totalRows]="rows.length"
          searchMode="local"
          (searchChanged)="onSearch($event)"
        ></ngcc-table-toolbar>

        <ngcc-table [columns]="columns" [rows]="rows"></ngcc-table>
      </div>
    `,
  }),
};

/* --- 7. Dynamic search --- */
export const DynamicSearch: Story = {
  args: {
    columns: sampleColumns,
    rows: sampleRows,
    loading: false,
    config: {
      pagination: false,
      pageSize: 10,
      rowSelection: 'none',
      search: { enabled: true, mode: 'dynamic' },
    },
  },
  render: (args) => ({
    props: {
      ...args,
      onSearchChange: (term: string) => {
        console.log('Dynamic search triggered:', term);
      },
    },
    template: `
      <div style="padding: 20px;">
        <p>Dynamic search emits query string to parent (console logs it).</p>

        <ngcc-table-toolbar
  [totalRows]="rows.length"
  searchMode="remote"
  (searchChanged)="onSearchChange($event)"
>
  <button ngcc-toolbar-actions class="cds--btn cds--btn--primary">Add User</button>
</ngcc-table-toolbar>

<ngcc-table
   [columns]="columns"
           [rows]="rows"
           [loading]="loading"
           [config]="config"
></ngcc-table>

      </div>
    `,
  }),
};
