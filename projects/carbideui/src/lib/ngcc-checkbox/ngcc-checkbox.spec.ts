import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NgccCheckbox } from './ngcc-checkbox';
import { FormsModule } from '@angular/forms';
import { provideZonelessChangeDetection } from '@angular/core';
import { axe } from 'vitest-axe';

describe('NgccCheckbox', () => {
  let component: NgccCheckbox;
  let fixture: ComponentFixture<NgccCheckbox>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NgccCheckbox, FormsModule],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(NgccCheckbox);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render with label', () => {
    fixture.componentRef.setInput('label', 'Accept terms');
    fixture.detectChanges();
    const labelEl = fixture.debugElement.query(By.css('label')).nativeElement;
    expect(labelEl.textContent).toContain('Accept terms');
  });

  it('should toggle checked state', () => {
    const inputEl: HTMLInputElement = fixture.debugElement.query(By.css('input')).nativeElement;
    expect(inputEl.checked).toBe(false);
    inputEl.click();
    fixture.detectChanges();
    expect(component.getChecked()).toBe(true);
  });

  it('should respect disabled state', () => {
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();
    const inputEl: HTMLInputElement = fixture.debugElement.query(By.css('input')).nativeElement;
    expect(inputEl.disabled).toBe(true);
  });

  it('should render helper text', () => {
    fixture.componentRef.setInput('helperText', 'This is help');
    fixture.detectChanges();
    const helperEl = fixture.debugElement.query(By.css('.cds--form__helper-text')).nativeElement;
    expect(helperEl.textContent).toContain('This is help');
  });

  it('should render error message when invalid', () => {
    fixture.componentRef.setInput('invalid', true);
    fixture.componentRef.setInput('errorMessage', 'Required!');
    fixture.detectChanges();
    const errorEl = fixture.debugElement.query(By.css('.cds--form-requirement')).nativeElement;
    expect(errorEl.textContent).toContain('Required!');
  });
  it('should set accessible name using label element', () => {
    fixture.componentRef.setInput('label', 'Checkbox');
    fixture.detectChanges();

    const inputEl: HTMLInputElement = fixture.debugElement.query(By.css('input')).nativeElement;
    const labelEl: HTMLElement = fixture.debugElement.query(By.css('label')).nativeElement;

    expect(labelEl.id).toContain('-label');
    expect(inputEl.getAttribute('aria-labelledby')).toContain(labelEl.id);
  });

  it('should link helper text via aria-labelledby', () => {
    fixture.componentRef.setInput('label', 'Checkbox');
    fixture.componentRef.setInput('helperText', 'Helper message');
    fixture.detectChanges();

    const inputEl: HTMLInputElement = fixture.debugElement.query(By.css('input')).nativeElement;
    const helperEl: HTMLElement = fixture.debugElement.query(
      By.css('.cds--form__helper-text'),
    ).nativeElement;

    expect(helperEl.id).toContain('-helper');
    expect(inputEl.getAttribute('aria-labelledby')).toContain(helperEl.id);
  });

  it('should set aria-invalid and link error text when invalid', () => {
    fixture.componentRef.setInput('label', 'Checkbox');
    fixture.componentRef.setInput('invalid', true);
    fixture.componentRef.setInput('errorMessage', 'This field is required');
    fixture.detectChanges();

    const inputEl: HTMLInputElement = fixture.debugElement.query(By.css('input')).nativeElement;
    const errorEl: HTMLElement = fixture.debugElement.query(
      By.css('.cds--checkbox__validation-msg'),
    ).nativeElement;

    expect(inputEl.getAttribute('aria-invalid')).toBe('true');
    expect(errorEl.id).toContain('-error');
    expect(inputEl.getAttribute('aria-labelledby')).toContain(errorEl.id);
  });

  it('should mark checkbox as required with aria-required', () => {
    fixture.componentRef.setInput('label', 'Checkbox');
    fixture.componentRef.setInput('required', true);
    fixture.detectChanges();

    const inputEl: HTMLInputElement = fixture.debugElement.query(By.css('input')).nativeElement;
    expect(inputEl.getAttribute('aria-required')).toBe('true');
  });

  it('should toggle state with keyboard (Space key)', () => {
    fixture.componentRef.setInput('label', 'Checkbox');
    fixture.detectChanges();

    const inputEl: HTMLInputElement = fixture.debugElement.query(By.css('input')).nativeElement;

    // Initially unchecked
    expect(inputEl.checked).toBe(false);

    // Simulate pressing Space key
    const event = new KeyboardEvent('keydown', { key: ' ' });
    inputEl.dispatchEvent(event);
    inputEl.click(); // simulate native toggle
    fixture.detectChanges();

    expect(inputEl.checked).toBe(true);
  });

  it('should have proper role and be focusable', () => {
    fixture.componentRef.setInput('label', 'Checkbox');
    fixture.detectChanges();

    const inputEl: HTMLInputElement = fixture.debugElement.query(By.css('input')).nativeElement;

    // role
    expect(inputEl.getAttribute('role')).toBe('checkbox');

    // focusable with tabindex
    inputEl.focus();
    expect(document.activeElement).toBe(inputEl);
  });
  it('should reflect indeterminate state on native input', () => {
    fixture.componentRef.setInput('indeterminate', true);
    fixture.detectChanges();

    const inputEl: HTMLInputElement = fixture.debugElement.query(By.css('input')).nativeElement;
    expect(inputEl.indeterminate).toBe(true);
    expect(inputEl.getAttribute('aria-checked')).toBe('mixed');
  });
  it('should expose indeterminate state accessibly', async () => {
    fixture.componentRef.setInput('label', 'Select items');
    fixture.componentRef.setInput('indeterminate', true);
    fixture.detectChanges();

    const inputEl: HTMLInputElement = fixture.debugElement.query(By.css('input')).nativeElement;

    expect(inputEl.indeterminate).toBe(true);
    expect(inputEl.getAttribute('aria-checked')).toBe('mixed');

    const results = await axe(fixture.nativeElement);
    expect(results).toHaveNoViolations();
  });
  it('should expose required state accessibly', async () => {
    fixture.componentRef.setInput('label', 'Accept terms');
    fixture.componentRef.setInput('required', true);
    fixture.detectChanges();

    const inputEl: HTMLInputElement = fixture.debugElement.query(By.css('input')).nativeElement;

    expect(inputEl.getAttribute('aria-required')).toBe('true');

    const results = await axe(fixture.nativeElement);
    expect(results).toHaveNoViolations();
  });
  it('should have no WCAG violations when disabled', async () => {
    fixture.componentRef.setInput('label', 'Accept terms');
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();

    const results = await axe(fixture.nativeElement);
    expect(results).toHaveNoViolations();
  });
  it('should have no WCAG violations in invalid state', async () => {
    fixture.componentRef.setInput('label', 'Accept terms');
    fixture.componentRef.setInput('invalid', true);
    fixture.componentRef.setInput('errorMessage', 'This field is required');
    fixture.detectChanges();

    const results = await axe(fixture.nativeElement);
    expect(results).toHaveNoViolations();
  });
  it('should have no WCAG violations with label and helper text', async () => {
    fixture.componentRef.setInput('label', 'Accept terms');
    fixture.componentRef.setInput('helperText', 'You must accept before continuing');
    fixture.detectChanges();

    const results = await axe(fixture.nativeElement);
    expect(results).toHaveNoViolations();
  });
  it('should have no WCAG violations (default)', async () => {
    const results = await axe(fixture.nativeElement);
    expect(results).toHaveNoViolations();
  });
  it('should provide fallback aria-label when no label is set', () => {
    const inputEl: HTMLInputElement = fixture.debugElement.query(By.css('input')).nativeElement;

    expect(inputEl.getAttribute('aria-label')).toBeTruthy();
  });
});
