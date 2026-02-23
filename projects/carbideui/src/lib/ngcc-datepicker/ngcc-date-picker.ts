import {
  Component,
  ElementRef,
  TemplateRef,
  ViewChild,
  forwardRef,
  ChangeDetectionStrategy,
  OnDestroy,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges,
  signal,
  effect,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { NgccIcon } from '../ngcc-icons/ngcc-icon';
import { NgccDatePickerCalendar } from './ngcc-date-picker-calendar';

export type NgccDateFormat = 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD';

@Component({
  selector: 'ngcc-date-picker',
  standalone: true,
  templateUrl: './ngcc-date-picker.html',
  styleUrls: ['./ngcc-date-picker.scss'],
  imports: [CommonModule, NgccIcon, NgccDatePickerCalendar],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => NgccDatePicker),
      multi: true,
    },
  ],
})
export class NgccDatePicker implements ControlValueAccessor, OnDestroy, OnChanges {
  private static idCounter = 0;

  // Inputs with @Input() decorators - backed by private signals with _ prefix
  @Input() type: 'simple' | 'single' | 'range' = 'simple';
  @Input() id: string = `datepicker-${NgccDatePicker.idCounter++}`;
  @Input() hasIcon: boolean = false;
  @Input() label: string | TemplateRef<unknown> | undefined;
  @Input() startLabel: string | TemplateRef<unknown> | null = null;
  @Input() endLabel: string | TemplateRef<unknown> | null = null;
  @Input() placeholder: string = 'mm/dd/yyyy';
  @Input() pattern: string = '^\\d{1,2}/\\d{1,2}/\\d{4}$';
  @Input() theme: 'light' | 'dark' = 'dark';
  @Input() disabled: boolean = false;
  @Input() readonly: boolean = false;
  @Input() invalid: boolean = false;
  @Input() invalidText: string | TemplateRef<unknown> | undefined;
  @Input() warn: boolean = false;
  @Input() warnText: string | TemplateRef<unknown> | undefined;
  @Input() helperText: string | TemplateRef<unknown> | undefined;
  @Input() skeleton: boolean = false;
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() minDate: Date | null = null;
  @Input() maxDate: Date | null = null;
  @Input() disabledDates: Date[] | null = null;
  @Input() format: NgccDateFormat = 'MM/DD/YYYY';
  @Input() locale: string = 'en-US';
  @Input() emitDateObjects: boolean = false;

  // Output EventEmitter
  @Output() valueChange = new EventEmitter<string | [string, string] | Date | [Date, Date]>();

  // Private backing signals for inputs
  private _type = signal<'simple' | 'single' | 'range'>('simple');
  private _id = signal<string>(`datepicker-${NgccDatePicker.idCounter++}`);
  private _hasIcon = signal(false);
  private _label = signal<string | TemplateRef<unknown> | undefined>(undefined);
  private _startLabel = signal<string | TemplateRef<unknown> | null>(null);
  private _endLabel = signal<string | TemplateRef<unknown> | null>(null);
  private _placeholder = signal('mm/dd/yyyy');
  private _pattern = signal('^\\d{1,2}/\\d{1,2}/\\d{4}$');
  private _theme = signal<'light' | 'dark'>('dark');
  private _disabled = signal(false);
  private _readonly = signal(false);
  private _invalid = signal(false);
  private _invalidText = signal<string | TemplateRef<unknown> | undefined>(undefined);
  private _warn = signal(false);
  private _warnText = signal<string | TemplateRef<unknown> | undefined>(undefined);
  private _helperText = signal<string | TemplateRef<unknown> | undefined>(undefined);
  private _skeleton = signal(false);
  private _size = signal<'sm' | 'md' | 'lg'>('md');
  private _minDate = signal<Date | null>(null);
  private _maxDate = signal<Date | null>(null);
  private _disabledDates = signal<Date[] | null>(null);
  private _format = signal<NgccDateFormat>('MM/DD/YYYY');
  private _locale = signal<string>('en-US');
  private _emitDateObjects = signal<boolean>(false);

  // Calendar UI state
  calendarOpen = signal(false);
  selectingRangeEnd = signal(false); // when true, next click picks range end

  // Internal value signals (control value + range end) - keep display strings
  value = signal('');
  endValue = signal(''); // used only for range mode

  // Expose computed Date objects for templates to bind safely
  readonly startDateForCalendar = (): Date | null => this.displayToDate(this.value());
  readonly endDateForCalendar = (): Date | null => this.displayToDate(this.endValue());

  @ViewChild('input', { static: true }) inputEl?: ElementRef<HTMLInputElement>;
  @ViewChild('endInput', { static: false }) endInputEl?: ElementRef<HTMLInputElement>;
  @ViewChild('calendarContainer', { static: false })
  calendarContainerEl?: ElementRef<HTMLElement>;

  // CVA callbacks
  #onTouched = (): void => {};
  #onChange: (
    value: string | [string, string] | Date | [Date, Date] | [Date | null, Date | null],
  ) => void = () => {};

  // document click handler - use arrow so removal works
  private _docClickHandler = (ev: Event): void => {
    // if calendar is open and click is outside this component -> close
    if (!this.calendarOpen()) return;
    const target = ev.target as Node | null;
    if (!target) return;
    if (!this.elementRef?.nativeElement.contains(target)) {
      this.closeCalendar();
    }
  };

  constructor(protected elementRef: ElementRef) {
    // Add/remove doc listener only while calendarOpen
    effect(() => {
      if (this.calendarOpen()) {
        document.addEventListener('click', this._docClickHandler, true);
      } else {
        document.removeEventListener('click', this._docClickHandler, true);
      }
    });
  }

  ngOnDestroy(): void {
    document.removeEventListener('click', this._docClickHandler, true);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['type']) this._type.set(this.type);
    if (changes['id']) this._id.set(this.id);
    if (changes['hasIcon']) this._hasIcon.set(this.hasIcon);
    if (changes['label']) this._label.set(this.label);
    if (changes['startLabel']) this._startLabel.set(this.startLabel);
    if (changes['endLabel']) this._endLabel.set(this.endLabel);
    if (changes['placeholder']) this._placeholder.set(this.placeholder);
    if (changes['pattern']) this._pattern.set(this.pattern);
    if (changes['theme']) this._theme.set(this.theme);
    if (changes['disabled']) this._disabled.set(this.disabled);
    if (changes['readonly']) this._readonly.set(this.readonly);
    if (changes['invalid']) this._invalid.set(this.invalid);
    if (changes['invalidText']) this._invalidText.set(this.invalidText);
    if (changes['warn']) this._warn.set(this.warn);
    if (changes['warnText']) this._warnText.set(this.warnText);
    if (changes['helperText']) this._helperText.set(this.helperText);
    if (changes['skeleton']) this._skeleton.set(this.skeleton);
    if (changes['size']) this._size.set(this.size);
    if (changes['minDate']) this._minDate.set(this.minDate);
    if (changes['maxDate']) this._maxDate.set(this.maxDate);
    if (changes['disabledDates']) this._disabledDates.set(this.disabledDates);
    if (changes['format']) this._format.set(this.format);
    if (changes['locale']) this._locale.set(this.locale);
    if (changes['emitDateObjects']) this._emitDateObjects.set(this.emitDateObjects);
  }

  // Getter methods for @Input properties
  getType = (): string => this._type();
  getId = (): string => this._id();
  getHasIcon = (): boolean => this._hasIcon();
  getLabel = (): string | undefined | TemplateRef<unknown> => this._label();
  getStartLabel = (): string | null | TemplateRef<unknown> => this._startLabel();
  getEndLabel = (): string | null | TemplateRef<unknown> => this._endLabel();
  getPlaceholder = (): string => this._placeholder();
  getPattern = (): string => this._pattern();
  getTheme = (): string => this._theme();
  getDisabled = (): boolean => this._disabled();
  getReadonly = (): boolean => this._readonly();
  getInvalid = (): boolean => this._invalid();
  getInvalidText = (): string | undefined | TemplateRef<unknown> => this._invalidText();
  getWarn = (): boolean => this._warn();
  getWarnText = (): string | undefined | TemplateRef<unknown> => this._warnText();
  getHelperText = (): string | undefined | TemplateRef<unknown> => this._helperText();
  getSkeleton = (): boolean => this._skeleton();
  getSize = (): string => this._size();
  getMinDate = (): Date | null => this._minDate();
  getMaxDate = (): Date | null => this._maxDate();
  getDisabledDates = (): Date[] | null => this._disabledDates();
  getFormat = (): NgccDateFormat => this._format();
  getLocale = (): string => this._locale();
  getEmitDateObjects = (): boolean => this._emitDateObjects();

  /* ----------------------
     ControlValueAccessor
     ---------------------- */

  writeValue(value: unknown): void {
    // Accept Date objects, ISO strings, or display strings
    if (this.getType() === 'range' && Array.isArray(value)) {
      const a = value[0];
      const b = value[1];
      if (a instanceof Date) this.value.set(this.formatDateDisplay(a));
      else if (typeof a === 'string') this.value.set(this.isoToDisplay(a));
      else this.value.set('');

      if (b instanceof Date) this.endValue.set(this.formatDateDisplay(b));
      else if (typeof b === 'string') this.endValue.set(this.isoToDisplay(b));
      else this.endValue.set('');
    } else if (value instanceof Date) {
      this.value.set(this.formatDateDisplay(value));
      if (this.getType() === 'range') this.endValue.set('');
    } else if (typeof value === 'string') {
      this.value.set(this.isoToDisplay(value));
      if (this.getType() === 'range') this.endValue.set('');
    } else {
      this.value.set('');
      if (this.getType() === 'range') this.endValue.set('');
    }
  }

  registerOnChange(
    fn: (
      value: string | [string, string] | Date | [Date, Date] | [Date | null, Date | null],
    ) => void,
  ): void {
    this.#onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.#onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this._disabled.set(isDisabled);
  }

  /* ----------------------
     Open / close calendar
     ---------------------- */
  openCalendar(isEnd = false): void {
    if (this.getDisabled() || this.getReadonly()) return;
    if (this.getType() === 'range') {
      this.selectingRangeEnd.set(isEnd);
    } else {
      this.selectingRangeEnd.set(false);
    }
    this.calendarOpen.set(true);
  }

  closeCalendar(): void {
    this.calendarOpen.set(false);
    // reset selectingRangeEnd when closing
    this.selectingRangeEnd.set(false);
  }

  toggleCalendar(isEnd = false): void {
    if (this.calendarOpen()) {
      this.closeCalendar();
    } else {
      this.openCalendar(isEnd);
    }
  }

  /* ----------------------
     Date selection & parsing
     ---------------------- */
  onDateSelected(date: Date): void {
    const formatted = this.formatDateDisplay(date);

    if (this.getType() === 'range') {
      // If we are currently selecting start (selectingRangeEnd=false)
      if (!this.selectingRangeEnd()) {
        this.value.set(formatted); // set start
        this.selectingRangeEnd.set(true);
        // keep calendar open to pick end — emit partial change
        this.emitRange(false);
        return;
      } else {
        // selecting end
        const startDate = this.displayToDate(this.value());
        const endDate = date; // clicked date

        if (!startDate) {
          // No start chosen yet — treat this as selecting the start
          this.value.set(formatted);
          this.selectingRangeEnd.set(true);
          this.emitRange(false);
          return;
        }

        // If the end is earlier than start, swap values to keep [start <= end]
        if (endDate < startDate) {
          const startFmt = this.formatDateDisplay(endDate);
          const endFmt = this.formatDateDisplay(startDate);
          this.value.set(startFmt);
          this.endValue.set(endFmt);
          this._invalid.set(false);
        } else {
          this.endValue.set(formatted);
          this._invalid.set(false);
        }

        this.emitRange(true);
        this.closeCalendar();
        return;
      }
    }

    // single or simple
    this.value.set(formatted);
    // emit ISO for consumers and CVA
    if (this.getEmitDateObjects()) {
      this.valueChange.emit(date);
      this.#onChange(date);
    } else {
      const iso = this.dateToISO(date);
      this.valueChange.emit(iso);
      this.#onChange(iso);
    }
    this.#onTouched();
    this.closeCalendar();
  }

  emitRange(final = true): void {
    if (this.getEmitDateObjects()) {
      const start = this.displayToDate(this.value());
      const end = this.displayToDate(this.endValue());
      const tuple: [Date | null, Date | null] = [start, end];
      this.valueChange.emit(tuple as unknown as [Date, Date]);
      this.#onChange(tuple);
    } else {
      const tuple: [string, string] = [
        this.displayToISO(this.value()) ?? '',
        this.displayToISO(this.endValue()) ?? '',
      ];
      this.valueChange.emit(tuple);
      this.#onChange(tuple);
    }
    if (final) this.#onTouched();
  }

  /* ----------------------
     Input typed changes
     ---------------------- */
  onInputChange(ev: Event, isEnd = false): void {
    const inp = ev.target as HTMLInputElement;
    const v = inp.value?.trim() ?? '';
    if (this.getType() === 'range') {
      if (isEnd) {
        this.endValue.set(v);
      } else {
        this.value.set(v);
      }
      this.validateRangeTyping();
      // emit ISO tuple if parsable; otherwise emit display strings as-is
      const startIso = this.displayToISO(this.value());
      const endIso = this.displayToISO(this.endValue());
      if (startIso || endIso) this.valueChange.emit([startIso ?? '', endIso ?? '']);
      this.emitRange(false);
    } else {
      this.value.set(v);
      // validate single typed value
      this._invalid.set(!this.validateFormat(v));
      // if it parses to a date emit ISO, otherwise emit raw value
      const parsed = this.displayToISO(v);
      const out = parsed ?? v;
      this.valueChange.emit(out);
      this.#onChange(out);
      this.#onTouched();
    }
  }

  validateRangeTyping(): void {
    const start = this.displayToDate(this.value());
    const end = this.displayToDate(this.endValue());

    // default invalid state
    let invalid = false;

    // format validation
    if (
      (this.value() && !this.validateFormat(this.value())) ||
      (this.endValue() && !this.validateFormat(this.endValue()))
    ) {
      invalid = true;
    }

    // logical ordering - if both typed and end < start, auto-swap to keep start <= end
    if (start && end && end < start) {
      const startFmt = this.formatDateDisplay(end);
      const endFmt = this.formatDateDisplay(start);
      // update signals so inputs show correct order
      this.value.set(startFmt);
      this.endValue.set(endFmt);
      // recompute start/end after swap
      // Note: after swap they are ordered correctly so do not mark invalid here
    }

    // start/end constraints - compare date-only
    const strip = (d: Date): number =>
      new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
    const min = this.getMinDate();
    const max = this.getMaxDate();

    if (start) {
      if (min && strip(start) < strip(min)) invalid = true;
      if (max && strip(start) > strip(max)) invalid = true;
    }

    if (end) {
      if (min && strip(end) < strip(min)) invalid = true;
      if (max && strip(end) > strip(max)) invalid = true;
    }

    this._invalid.set(invalid);
    this._warn.set(false);
  }

  validateFormat(v: string): boolean {
    if (!v) return true;
    try {
      const re = new RegExp(this.getPattern());
      return re.test(v);
    } catch {
      // if invalid pattern provided, just return true to avoid blocking
      return true;
    }
  }

  /* ----------------------
     Utilities
     ---------------------- */
  // Formatting helpers
  private pad(n: number): string {
    return String(n).padStart(2, '0');
  }

  // Display format (MM/DD/YYYY or DD/MM/YYYY)
  private formatDateDisplay(d: Date): string {
    const mm = this.pad(d.getMonth() + 1);
    const dd = this.pad(d.getDate());
    const yyyy = d.getFullYear();
    switch (this.getFormat()) {
      case 'DD/MM/YYYY':
        return `${dd}/${mm}/${yyyy}`;
      case 'MM/DD/YYYY':
        return `${mm}/${dd}/${yyyy}`;
      case 'YYYY-MM-DD':
        return `${yyyy}-${mm}-${dd}`;
      default:
        return `${dd}/${mm}/${yyyy}`;
    }
  }

  // Convert display string to Date using configured format
  private displayToDate(v: string): Date | null {
    if (!v) return null;
    const parts = v.split('/');
    if (parts.length !== 3) return null;
    let mm: number, dd: number;
    if (this.getFormat() === 'DD/MM/YYYY') {
      dd = Number(parts[0]);
      mm = Number(parts[1]);
    } else {
      mm = Number(parts[0]);
      dd = Number(parts[1]);
    }
    const yyyy = Number(parts[2]);
    if (!mm || !dd || !yyyy) return null;
    return new Date(yyyy, mm - 1, dd);
  }

  // ISO helpers (YYYY-MM-DD)
  private dateToISO(d: Date): string {
    return `${d.getFullYear()}-${this.pad(d.getMonth() + 1)}-${this.pad(d.getDate())}`;
  }

  private isoToDate(iso: string): Date | null {
    if (!iso) return null;
    const parts = iso.split('-');
    if (parts.length !== 3) return null;
    const y = Number(parts[0]);
    const m = Number(parts[1]);
    const d = Number(parts[2]);
    if (!y || !m || !d) return null;
    return new Date(y, m - 1, d);
  }

  private isoToDisplay(iso: string): string {
    const d = this.isoToDate(iso);
    return d ? this.formatDateDisplay(d) : '';
  }

  private displayToISO(v: string): string | null {
    const d = this.displayToDate(v);
    return d ? this.dateToISO(d) : null;
  }

  // public template guard used in templates
  isTemplate(value: unknown): value is TemplateRef<unknown> {
    return value instanceof TemplateRef;
  }

  // Make some helpers public so template can call them safely
  // Note: templates should prefer computed getters above when possible
  displayToDatePublic(v: string): Date | null {
    return this.displayToDate(v);
  }

  // TemplateRef safeties: return TemplateRef or null so templates can pass
  // only TemplateRef to ngTemplateOutlet (avoids union type errors)
  readonly labelTemplate = (): TemplateRef<unknown> | null =>
    this.isTemplate(this.getLabel()) ? (this.getLabel() as TemplateRef<unknown>) : null;

  readonly startLabelTemplate = (): TemplateRef<unknown> | null =>
    this.isTemplate(this.getStartLabel()) ? (this.getStartLabel() as TemplateRef<unknown>) : null;

  readonly endLabelTemplate = (): TemplateRef<unknown> | null =>
    this.isTemplate(this.getEndLabel()) ? (this.getEndLabel() as TemplateRef<unknown>) : null;

  readonly helperTextTemplate = (): TemplateRef<unknown> | null =>
    this.isTemplate(this.getHelperText()) ? (this.getHelperText() as TemplateRef<unknown>) : null;

  readonly invalidTextTemplate = (): TemplateRef<unknown> | null =>
    this.isTemplate(this.getInvalidText()) ? (this.getInvalidText() as TemplateRef<unknown>) : null;

  readonly warnTextTemplate = (): TemplateRef<unknown> | null =>
    this.isTemplate(this.getWarnText()) ? (this.getWarnText() as TemplateRef<unknown>) : null;
}
