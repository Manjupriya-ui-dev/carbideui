import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NgccDatePicker } from './ngcc-date-picker';
import { By } from '@angular/platform-browser';
import { provideZonelessChangeDetection } from '@angular/core';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { Component } from '@angular/core';
import { NgccDatePickerCalendar } from './ngcc-date-picker-calendar';
import { NgccIcon } from '../ngcc-icons/ngcc-icon';
import { axe } from 'vitest-axe';

describe('NgccDatePicker', () => {
  let fixture: ComponentFixture<NgccDatePicker>;
  let component: NgccDatePicker;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NgccDatePicker, ReactiveFormsModule, NgccDatePickerCalendar, NgccIcon],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(NgccDatePicker);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create and render base structure', () => {
    expect(component).toBeTruthy();
    expect(fixture.debugElement.query(By.css('.cds--date-picker'))).toBeTruthy();
    expect(fixture.debugElement.query(By.css('.cds--date-picker__input'))).toBeTruthy();
  });

  it('should open calendar on input click', async () => {
    const inputEl = fixture.debugElement.query(By.css('.cds--date-picker__input'));
    expect(inputEl).toBeTruthy();

    // Trigger both click and focus to match real user behavior
    inputEl.nativeElement.click();
    inputEl.nativeElement.dispatchEvent(new Event('focus'));
    fixture.detectChanges();

    // Wait for any signals or async rendering to settle
    await fixture.whenStable();
    fixture.detectChanges();
    await fixture.whenRenderingDone();

    // Query calendar after change detection flushed twice
    const calendar = fixture.debugElement.query(By.css('.ngcc--date-picker__calendar'));
    expect(calendar).toBeTruthy();
  });

  it('should emit Date object when emitDateObjects = true', async () => {
    fixture.componentRef.setInput('emitDateObjects', true);
    fixture.detectChanges();

    const emittedValues: any[] = [];
    component.valueChange.subscribe((v) => emittedValues.push(v));

    // open calendar
    const input = fixture.debugElement.query(By.css('.cds--date-picker__input'));
    (input.nativeElement as HTMLInputElement).dispatchEvent(new Event('focus'));
    fixture.detectChanges();
    await fixture.whenStable();

    // simulate date selection
    component.onDateSelected(new Date(2025, 9, 22));
    fixture.detectChanges();
    await fixture.whenStable();

    expect(emittedValues.length).toBe(1);
    expect(emittedValues[0] instanceof Date).toBe(true);
  });

  it('should disable dates outside min/max range', async () => {
    const min = new Date(2025, 9, 10);
    const max = new Date(2025, 9, 20);
    fixture.componentRef.setInput('minDate', min);
    fixture.componentRef.setInput('maxDate', max);
    fixture.detectChanges();

    // open calendar
    const input = fixture.debugElement.query(By.css('.cds--date-picker__input'));
    (input.nativeElement as HTMLInputElement).dispatchEvent(new Event('focus'));
    fixture.detectChanges();
    await fixture.whenStable();

    const disabledDays = fixture.debugElement.queryAll(By.css('.ngcc--date-picker__day--disabled'));
    expect(disabledDays.length).toBeGreaterThan(0);
  });

  it('should support range selection and emit tuple', async () => {
    fixture.componentRef.setInput('type', 'range');
    fixture.detectChanges();

    const emittedValues: any[] = [];
    component.valueChange.subscribe((v) => emittedValues.push(v));

    // simulate selecting two dates
    component.onDateSelected(new Date(2025, 9, 10));
    fixture.detectChanges();

    component.onDateSelected(new Date(2025, 9, 15));
    fixture.detectChanges();

    expect(emittedValues.length).toBeGreaterThan(0);
    const last = emittedValues.at(-1);
    expect(Array.isArray(last)).toBe(true);
    expect(last.length).toBe(2);
  });

  it('should integrate with Reactive Forms (ISO string)', async () => {
    @Component({
      standalone: true,
      imports: [NgccDatePicker, ReactiveFormsModule],
      template: `<ngcc-date-picker [formControl]="ctrl"></ngcc-date-picker>`,
    })
    class HostCmp {
      ctrl = new FormControl<string | null>(null);
    }

    const hostFixture = TestBed.createComponent(HostCmp);
    hostFixture.detectChanges();
    await hostFixture.whenStable();

    hostFixture.componentInstance.ctrl.setValue('2025-10-05');
    hostFixture.detectChanges();
    await hostFixture.whenStable();

    const input = hostFixture.debugElement.query(By.css('.cds--date-picker__input'))
      .nativeElement as HTMLInputElement;
    expect(input.value).toContain('2025');
  });

  it('should emit ISO string in single mode when selecting a date', async () => {
    const emittedValues: any[] = [];
    component.valueChange.subscribe((v) => emittedValues.push(v));

    // simulate date selection
    component.onDateSelected(new Date(2025, 9, 22));
    fixture.detectChanges();
    await fixture.whenStable();

    expect(emittedValues.length).toBe(1);
    const emitted = emittedValues[0];
    expect(typeof emitted).toBe('string');
  });

  describe('NgccDatePicker – WCAG / Accessibility', () => {
    it('has no WCAG violations in default (closed) state', async () => {
      const results = await axe(fixture.nativeElement);

      expect(results).toHaveNoViolations();
    });

    it('associates label with input correctly', () => {
      fixture.componentRef.setInput('label', 'Select date');
      fixture.detectChanges();

      const label = fixture.debugElement.query(By.css('label.cds--label'));
      const input = fixture.debugElement.query(By.css('input.cds--date-picker__input'));

      expect(label).toBeTruthy();
      expect(input).toBeTruthy();
      expect(label.attributes['for']).toBe(input.attributes['id']);
    });

    it('exposes calendar popup as an accessible dialog', async () => {
      const input = fixture.debugElement.query(By.css('input'));
      input.nativeElement.dispatchEvent(new Event('focus'));
      fixture.detectChanges();
      await fixture.whenStable();

      const popup = fixture.debugElement.query(By.css('.ngcc-date-picker__popup'));
      expect(popup).toBeTruthy();
      expect(popup.attributes['role']).toBe('dialog');
      expect(popup.attributes['aria-modal']).toBe('true');

      fixture.detectChanges();
      await fixture.whenStable();
      const results = await axe(fixture.nativeElement);

      expect(results).toHaveNoViolations();
    });

    it('reflects disabled state accessibly', async () => {
      fixture.componentRef.setInput('disabled', true);
      fixture.detectChanges();

      const input = fixture.debugElement.query(By.css('input')).nativeElement as HTMLInputElement;

      expect(input.disabled).toBe(true);

      const results = await axe(fixture.nativeElement);

      expect(results).toHaveNoViolations();
    });

    it('skeleton state is decorative and exposes no form controls', async () => {
      fixture.componentRef.setInput('skeleton', true);
      fixture.detectChanges();

      const inputs = fixture.debugElement.queryAll(By.css('input'));
      expect(inputs.length).toBe(0);

      const results = await axe(fixture.nativeElement);
      expect(results).toHaveNoViolations();
    });

    it('range mode exposes two labeled inputs accessibly', async () => {
      fixture.componentRef.setInput('type', 'range');
      fixture.detectChanges();

      const labels = fixture.debugElement.queryAll(By.css('label.cds--date-picker__sublabel'));
      const inputs = fixture.debugElement.queryAll(By.css('input.cds--date-picker__input'));

      expect(labels.length).toBe(2);
      expect(inputs.length).toBe(2);

      labels.forEach((label, i) => {
        expect(label.attributes['for']).toBe(inputs[i].attributes['id']);
      });

      const results = await axe(fixture.nativeElement);

      expect(results).toHaveNoViolations();
    });
  });
});
