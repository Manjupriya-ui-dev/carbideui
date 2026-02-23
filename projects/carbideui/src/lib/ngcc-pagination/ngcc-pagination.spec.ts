import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideZonelessChangeDetection } from '@angular/core';
import { NgccPagination } from './ngcc-pagination';
import { NgccIcon } from '../ngcc-icons/ngcc-icon';
import { axe } from 'vitest-axe';

describe('NgccPagination (zoneless)', () => {
  let fixture: ComponentFixture<NgccPagination>;
  let component: NgccPagination;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NgccPagination, NgccIcon],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(NgccPagination);
    component = fixture.componentInstance;

    fixture.componentRef.setInput('page', 1);
    fixture.componentRef.setInput('totalItems', 50);
    fixture.componentRef.setInput('pageSizes', [10, 20, 50]);
    fixture.componentRef.setInput('pageSize', 10);
    fixture.componentRef.setInput('loopNavigation', true);

    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should compute total pages correctly', () => {
    expect((component as any).totalPages()).toBe(5);
  });

  it('should render correct text for current range', () => {
    const rangeText = fixture.debugElement.query(By.css('.cds--pagination__text--items'));
    expect(rangeText.nativeElement.textContent.trim()).toBe('1–10 of 50');
  });

  it('should disable prev button on first page', () => {
    const prevBtn = fixture.debugElement.query(
      By.css('.cds--pagination__button--backward'),
    ).nativeElement;
    expect(prevBtn.disabled).toBe(true);
  });

  it('should disable next button when on last page', async () => {
    fixture.componentRef.setInput('page', 5);
    fixture.detectChanges();
    await fixture.whenStable();

    const nextBtn = fixture.debugElement.query(
      By.css('.cds--pagination__button--forward'),
    ).nativeElement;
    expect(nextBtn.disabled).toBe(true);
  });

  it('should emit pageChange when next button clicked', async () => {
    vi.spyOn(component.pageChange, 'emit');
    const nextBtn = fixture.debugElement.query(By.css('.cds--pagination__button--forward'));
    nextBtn.triggerEventHandler('click');
    fixture.detectChanges();
    await fixture.whenStable();

    expect(component.pageChange.emit).toHaveBeenCalledWith(2);
  });

  it('should emit pageChange when prev button clicked', async () => {
    vi.spyOn(component.pageChange, 'emit');
    fixture.componentRef.setInput('page', 3);
    fixture.detectChanges();
    await fixture.whenStable();

    const prevBtn = fixture.debugElement.query(By.css('.cds--pagination__button--backward'));
    prevBtn.triggerEventHandler('click');
    fixture.detectChanges();
    await fixture.whenStable();

    expect(component.pageChange.emit).toHaveBeenCalledWith(2);
  });

  it('should emit pageSizeChange when dropdown changes', async () => {
    vi.spyOn(component.pageSizeChange, 'emit');
    const select = fixture.debugElement.query(By.css('select')).nativeElement as HTMLSelectElement;
    select.value = select.options[1].value; // select "20"
    select.dispatchEvent(new Event('change'));
    fixture.detectChanges();
    await fixture.whenStable();

    expect(component.pageSizeChange.emit).toHaveBeenCalledWith(20);
  });

  it('should update start and end items correctly on page change', async () => {
    fixture.componentRef.setInput('page', 2);
    fixture.detectChanges();
    await fixture.whenStable();

    const rangeText = fixture.debugElement.query(By.css('.cds--pagination__text--items'));
    expect(rangeText.nativeElement.textContent.trim()).toBe('11–20 of 50');
  });

  it('should compute correct startItem and endItem for partial last page', async () => {
    fixture.componentRef.setInput('page', 5);
    fixture.detectChanges();
    await fixture.whenStable();

    expect((component as any).startItem()).toBe(41);
    expect((component as any).endItem()).toBe(50);
  });

  it('should respond to keyboard navigation', async () => {
    vi.spyOn(component.pageChange, 'emit');
    const right = new KeyboardEvent('keydown', { key: 'ArrowRight' });
    const left = new KeyboardEvent('keydown', { key: 'ArrowLeft' });

    const container = fixture.debugElement.query(By.css('.cds--pagination__right'));
    container.nativeElement.dispatchEvent(right);
    container.nativeElement.dispatchEvent(left);
    fixture.detectChanges();

    expect(component.pageChange.emit).toHaveBeenCalledTimes(2);
  });

  it('should compute safe start value when totalItems = 0', async () => {
    fixture.componentRef.setInput('totalItems', 0);
    fixture.detectChanges();
    await fixture.whenStable();

    expect((component as any).startItem()).toBe(0);
    expect((component as any).endItem()).toBe(0);
  });

  it('should not emit pageChange if already on same page', async () => {
    vi.spyOn(component.pageChange, 'emit');
    (component as any).goToPage(1);
    fixture.detectChanges();
    expect(component.pageChange.emit).not.toHaveBeenCalled();
  });

  describe('NgccPagination – WCAG / Accessibility', () => {
    describe('Landmark & structure', () => {
      it('should expose navigation landmark', () => {
        const host = fixture.nativeElement;
        expect(host.getAttribute('role')).toBe('navigation');
        expect(host.getAttribute('aria-label')).toBe('Pagination');
      });

      it('should group pagination controls correctly', () => {
        const group = fixture.nativeElement.querySelector('.cds--pagination__right');
        expect(group.getAttribute('role')).toBe('group');
        expect(group.getAttribute('aria-label')).toBe('Pagination controls');
      });
    });

    describe('Accessible names & labels', () => {
      it('should label page size selector', () => {
        const select = fixture.nativeElement.querySelector('select');
        expect(select.getAttribute('aria-label')).toBe('Items per page');
      });

      it('should expose accessible labels for navigation buttons', () => {
        const prev = fixture.nativeElement.querySelector('.cds--pagination__button--backward');
        const next = fixture.nativeElement.querySelector('.cds--pagination__button--forward');

        expect(prev.getAttribute('aria-label')).toBe('Previous page');
        expect(next.getAttribute('aria-label')).toBe('Next page');
      });
    });

    describe('Disabled state semantics', () => {
      it('should disable previous button on first page', () => {
        fixture.componentRef.setInput('page', 1);
        fixture.detectChanges();

        const prev = fixture.nativeElement.querySelector('.cds--pagination__button--backward');

        expect(prev.disabled).toBe(true);
      });

      it('should disable next button on last page', async () => {
        fixture.componentRef.setInput('page', 5);
        fixture.detectChanges();
        await fixture.whenStable();

        const next = fixture.nativeElement.querySelector('.cds--pagination__button--forward');

        expect(next.disabled).toBe(true);
      });
    });

    describe('Keyboard accessibility (WCAG 2.1.1)', () => {
      it('should be focusable as a group', () => {
        const group = fixture.nativeElement.querySelector('.cds--pagination__right');
        expect(group.getAttribute('tabindex')).toBe('0');
      });

      it('should navigate pages using ArrowRight / ArrowLeft', async () => {
        vi.spyOn(component.pageChange, 'emit');

        const group = fixture.nativeElement.querySelector('.cds--pagination__right');

        group.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
        group.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft' }));

        fixture.detectChanges();
        await fixture.whenStable();

        expect(component.pageChange.emit).toHaveBeenCalledTimes(2);
      });

      it('should loop pages when loopNavigation is enabled', async () => {
        vi.spyOn(component.pageChange, 'emit');

        fixture.componentRef.setInput('page', 5);
        fixture.detectChanges();
        await fixture.whenStable();

        const group = fixture.nativeElement.querySelector('.cds--pagination__right');

        group.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
        fixture.detectChanges();

        expect(component.pageChange.emit).toHaveBeenCalledWith(1);
      });
    });

    describe('Screen reader announcements', () => {
      it('should expose current page information', () => {
        const pageInfo = fixture.nativeElement.querySelector('.cds--pagination__page-info');

        expect(pageInfo.textContent).toContain('Page');
        expect(pageInfo.getAttribute('aria-current')).toBe('page');
      });

      it('should expose visible item range text', () => {
        const range = fixture.nativeElement.querySelector('.cds--pagination__text--items');

        expect(range.textContent).toContain('of');
      });
    });

    describe('Axe – WCAG compliance', () => {
      it('should have no WCAG violations', async () => {
        const pagination = fixture.nativeElement;
        const results = await axe(pagination);
        expect(results).toHaveNoViolations();
      });
    });
  });
});
