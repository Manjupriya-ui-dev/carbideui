import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideZonelessChangeDetection } from '@angular/core';
import { NgccTable } from './ngcc-table';
import { NgccTableColumn, NgccTableConfig } from './ngcc-table.types';
import { NgccTableService } from './ngcc-table.service';
import { NgccTableSearchService } from './ngcc-table-search.service';
import { axe } from 'vitest-axe';

interface User {
  id: number;
  name: string;
  age: number;
}

describe('NgccTable', () => {
  let fixture: ComponentFixture<NgccTable<User>>;
  let component: NgccTable<User>;
  let searchService: NgccTableSearchService<User>;

  const columns: NgccTableColumn<User>[] = [
    { key: 'id', header: 'ID', sortable: true },
    { key: 'name', header: 'Name', sortable: true },
    { key: 'age', header: 'Age', sortable: true },
  ];

  const rows: User[] = [
    { id: 2, name: 'Alice', age: 25 },
    { id: 1, name: 'Bob', age: 30 },
    { id: 3, name: 'Charlie', age: 20 },
  ];

  const config: NgccTableConfig = {
    pagination: true,
    pageSize: 2,
    rowSelection: 'multiple',
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NgccTable],
      providers: [NgccTableService, NgccTableSearchService, provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(NgccTable<User>);
    component = fixture.componentInstance;
    searchService = TestBed.inject(NgccTableSearchService<User>);

    fixture.componentRef.setInput('columns', columns);
    fixture.componentRef.setInput('rows', rows);
    fixture.componentRef.setInput('config', config);
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  it('should render table headers', () => {
    const headers = fixture.debugElement.queryAll(By.css('th .cds--table-header-label'));
    expect(headers.length).toBe(columns.length);
    expect(headers[0].nativeElement.textContent.trim()).toBe('ID');
    expect(headers[1].nativeElement.textContent.trim()).toBe('Name');
  });

  it('should render initial rows (with pagination)', () => {
    const cells = fixture.debugElement.queryAll(By.css('tbody .cds--data-table__cell'));
    expect(cells.length).toBe(2 * columns.length); // pageSize 2 × 3 columns
  });

  it('should toggle sort order on header click', async () => {
    const header = fixture.debugElement.queryAll(By.css('th button'))[0];

    // Initial: none
    expect(component.getSortAria('id')).toBe('none');

    // First click: asc
    header.triggerEventHandler('click');
    fixture.detectChanges();
    await fixture.whenStable();
    expect(component.getSortAria('id')).toBe('ascending');

    // Second click: desc
    header.triggerEventHandler('click');
    fixture.detectChanges();
    await fixture.whenStable();
    expect(component.getSortAria('id')).toBe('descending');

    // Third click: clears sort
    header.triggerEventHandler('click');
    fixture.detectChanges();
    await fixture.whenStable();
    expect(component.getSortAria('id')).toBe('none');
  });

  it('should sort data ascending and descending', async () => {
    component['toggleSort']('id', true);
    fixture.detectChanges();
    await fixture.whenStable();

    let processed = component['processedRows']();
    expect(processed.map((r) => r.id)).toEqual([1, 2]); // first page

    component['toggleSort']('id', true);
    fixture.detectChanges();
    await fixture.whenStable();

    processed = component['processedRows']();
    expect(processed.map((r) => r.id)).toEqual([3, 2]); // descending
  });

  it('should select and deselect individual rows', async () => {
    vi.spyOn(component.rowSelect, 'emit');

    const rowEls = fixture.debugElement.queryAll(By.css('tbody tr'));
    rowEls[0].nativeElement.click();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(component.rowSelect.emit).toHaveBeenCalledWith([rows[0]]);

    rowEls[0].nativeElement.click();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(component.rowSelect.emit).toHaveBeenCalledWith([]);
  });

  it('should select all rows when header checkbox clicked', async () => {
    const emitSpy = vi.spyOn(component.rowSelect, 'emit');
    const headerCheckbox = fixture.debugElement.query(
      By.css('.cds--table-column-checkbox ngcc-checkbox'),
    );

    headerCheckbox.triggerEventHandler('checkedChange');
    fixture.detectChanges();
    await fixture.whenStable();
    expect(emitSpy).toHaveBeenCalled();
    const lastEmit = emitSpy.mock.calls.at(-1)?.[0];
    expect(lastEmit?.length).toBe(2);
    expect(emitSpy.mock.calls.some(([rows]) => rows.length === 2)).toBe(true);
  });

  it('should show skeleton rows when loading=true', async () => {
    fixture.componentRef.setInput('loading', true);
    fixture.detectChanges();
    await fixture.whenStable();

    const skeletons = fixture.debugElement.queryAll(By.css('ngcc-skeleton'));
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('should paginate to next page', async () => {
    const rows = [
      { id: 1, name: 'A' },
      { id: 2, name: 'B' },
      { id: 3, name: 'C' },
    ];

    fixture.componentRef.setInput('rows', rows);
    fixture.componentRef.setInput('columns', [
      { key: 'id', header: 'ID' },
      { key: 'name', header: 'Name' },
    ]);
    fixture.componentRef.setInput('config', { pagination: true, pageSize: 2 });
    fixture.detectChanges();
    await fixture.whenStable();

    // Page 1: should show first 2 rows
    let renderedRows = fixture.nativeElement.querySelectorAll(
      '.cds--data-table__body .cds--data-table__row',
    );
    expect(renderedRows.length).toBe(2);
    expect(renderedRows[0].textContent).toContain('1');
    expect(renderedRows[1].textContent).toContain('2');

    // Simulate next page click
    (component as any).goToPage(1); // internal signal update
    fixture.detectChanges();
    await fixture.whenStable();

    // Force recompute processedRows (signal-based)
    const nextPageRows = (component as any).processedRows();
    expect(nextPageRows.length).toBe(1);
    expect(nextPageRows[0].id).toBe(3);

    // Confirm rendered DOM updates
    fixture.detectChanges();
    renderedRows = fixture.nativeElement.querySelectorAll(
      '.cds--data-table__body .cds--data-table__row',
    );
    expect(renderedRows.length).toBe(1);
    expect(renderedRows[0].textContent).toContain('3');
  });

  it('should compute total pages correctly', () => {
    expect(component['totalPages']()).toBe(2);
  });

  it('should handle search locally', async () => {
    searchService.query.set('Alice');
    fixture.detectChanges();
    await fixture.whenStable();

    const processed = component['processedRows']();
    expect(processed.length).toBe(1);
    expect(processed[0].name).toBe('Alice');
  });

  it('should compute sort icon correctly', () => {
    component.sortState = { key: 'name', dir: 'asc' };
    expect(component['getSortIcon']('name')).toBe('arrow_up');

    component.sortState = { key: 'name', dir: 'desc' };
    expect(component['getSortIcon']('name')).toBe('arrow_down');

    component.sortState = null;
    expect(component['getSortIcon']('age')).toBe('sort_icon');
  });

  it('should compute indeterminate state when some rows selected', async () => {
    component['selected'].set(new Set([0]));
    fixture.detectChanges();
    expect(component['isIndeterminate']()).toBe(true);
  });

  it('should stringify null/undefined values safely', () => {
    expect(component['stringify'](null)).toBe('');
    expect(component['stringify'](undefined)).toBe('');
    expect(component['stringify']('Hello')).toBe('Hello');
  });

  describe('NgccTable – WCAG / Accessibility', () => {
    describe('Semantic table structure', () => {
      it('should render a semantic table', () => {
        const table = fixture.nativeElement.querySelector('table');
        expect(table).toBeTruthy();
      });

      it('should render column headers with scope="col"', () => {
        const headers = fixture.nativeElement.querySelectorAll('th');
        expect(headers.length).toBe(columns.length + 1); // + checkbox column

        headers.forEach((th: HTMLElement) => {
          expect(th.getAttribute('scope')).toBe('col');
        });
      });

      it('should render consistent rows and cells', () => {
        const rows = fixture.nativeElement.querySelectorAll('tbody tr');
        const cells = fixture.nativeElement.querySelectorAll('tbody td');

        expect(rows.length).toBe(2); // pageSize
        expect(cells.length).toBe(rows.length * (columns.length + 1));
      });
    });

    describe('ARIA – sorting', () => {
      it('should expose aria-sort on sortable headers', async () => {
        const sortableHeader = fixture.debugElement.query(By.css('th.cds--table-sortable'));

        expect(sortableHeader.attributes['aria-sort']).toBe('none');

        const sortButton = sortableHeader.query(By.css('button'));
        sortButton.triggerEventHandler('click');
        fixture.detectChanges();
        await fixture.whenStable();

        expect(sortableHeader.attributes['aria-sort']).toBe('ascending');
      });

      it('should update aria-label for sort state', () => {
        const label = component.getSortAriaLabel('id');
        expect(label).toContain('Sort by');
      });
    });

    describe('ARIA – row selection', () => {
      it('should expose aria-selected on rows', async () => {
        const row = fixture.debugElement.query(By.css('tbody tr'));
        row.nativeElement.click();

        fixture.detectChanges();
        await fixture.whenStable();

        expect(row.attributes['aria-selected']).toBe('true');
      });

      it('should set header checkbox indeterminate state', () => {
        component['selected'].set(new Set([0]));
        fixture.detectChanges();

        expect(component['isIndeterminate']()).toBe(true);
      });
    });

    describe('Loading state accessibility', () => {
      it('should expose aria-busy while loading', async () => {
        fixture.componentRef.setInput('loading', true);
        fixture.detectChanges();
        await fixture.whenStable();

        const tableWrapper = fixture.nativeElement.querySelector('.cds--data-table-wrapper');

        expect(tableWrapper.getAttribute('aria-busy')).toBe('true');
      });

      it('should hide data rows from screen readers when loading', () => {
        fixture.componentRef.setInput('loading', true);
        fixture.detectChanges();

        const tbody = fixture.nativeElement.querySelector('tbody');
        expect(tbody.getAttribute('aria-hidden')).toBe('true');
      });
    });

    describe('Keyboard accessibility', () => {
      it('should allow keyboard activation of sort', async () => {
        const button = fixture.debugElement.query(By.css('th button'))
          .nativeElement as HTMLButtonElement;

        button.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
        fixture.detectChanges();
        await fixture.whenStable();

        expect(component.getSortAria('id')).toBe('ascending');
      });
    });

    describe('Axe – no WCAG violations', () => {
      it('should have no WCAG violations for table container', async () => {
        const table = fixture.nativeElement.querySelector('.cds--data-table-wrapper');

        const results = await axe(table);
        expect(results).toHaveNoViolations();
      });
    });
  });
});
