import {
  ChangeDetectionStrategy,
  Component,
  Output,
  EventEmitter,
  Input,
  OnChanges,
  SimpleChanges,
  signal,
  computed,
  OnInit,
} from '@angular/core';
import { NgccIcon } from '../ngcc-icons/ngcc-icon';
import { CommonModule } from '@angular/common';

export interface NgccCalendarCell {
  day?: number;
  date?: Date;
  empty: boolean;
  isToday?: boolean;
  isStart?: boolean;
  isEnd?: boolean;
  inRange?: boolean;
  disabled?: boolean;
  index?: number;
}

@Component({
  selector: 'ngcc-date-picker-calendar',
  standalone: true,
  imports: [CommonModule, NgccIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './ngcc-date-picker-calendar.html',
  styleUrls: ['./ngcc-date-picker-calendar.scss'],
  host: {
    '(document:keydown)': 'handleKey($event)',
  },
})
export class NgccDatePickerCalendar implements OnInit, OnChanges {
  @Output() dateSelected = new EventEmitter<Date>();
  @Output() closed = new EventEmitter<void>();

  // @Input properties with private backing signals
  @Input() startDate: Date | null = null;
  @Input() endDate: Date | null = null;
  @Input() minDate: Date | null = null;
  @Input() maxDate: Date | null = null;
  @Input() disabledDates: Date[] | null = null;
  @Input() locale: string = 'en-US';
  @Input() format: 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD' = 'MM/DD/YYYY';
  @Input() emitDateObjects: boolean = false;

  // Private backing signals for inputs
  private _startDate = signal<Date | null>(null);
  private _endDate = signal<Date | null>(null);
  private _minDate = signal<Date | null>(null);
  private _maxDate = signal<Date | null>(null);
  private _disabledDates = signal<Date[] | null>(null);
  private _locale = signal<string>('en-US');
  private _format = signal<'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD'>('MM/DD/YYYY');
  private _emitDateObjects = signal<boolean>(false);

  hoverDate = signal<Date | null>(null);

  private now = new Date();
  private yearRangeStart = 1970;
  private yearRangeEnd = 2100;

  readonly yearRange = computed(() => {
    const range: number[] = [];
    for (let y = this.yearRangeStart; y <= this.yearRangeEnd; y++) range.push(y);
    return range;
  });
  currentMonth = signal<number>(this.now.getMonth());
  currentYear = signal<number>(this.now.getFullYear());
  focusedIndex = signal<number | null>(null);

  monthNames: string[] = [];
  weekDays: string[] = [];

  cells = computed<NgccCalendarCell[]>(() => this.buildNgccCalendarCells());

  weeks = computed<NgccCalendarCell[][]>(() => {
    const allCells = this.cells();
    const rows: NgccCalendarCell[][] = [];
    for (let i = 0; i < allCells.length; i += 7) {
      rows.push(allCells.slice(i, i + 7));
    }
    return rows;
  });

  ngOnInit(): void {
    this.syncMonthYearFromStartDate();
    this.initLocaleLabels();

    // Optional: ensure default focus on today's cell
    const todayIndex = this.cells().findIndex((c) => !c.empty && c.isToday && !c.disabled);
    this.focusedIndex.set(todayIndex >= 0 ? todayIndex : null);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['startDate']) this._startDate.set(this.startDate);
    if (changes['endDate']) this._endDate.set(this.endDate);
    if (changes['minDate']) this._minDate.set(this.minDate);
    if (changes['maxDate']) this._maxDate.set(this.maxDate);
    if (changes['disabledDates']) this._disabledDates.set(this.disabledDates);
    if (changes['locale']) this._locale.set(this.locale);
    if (changes['format']) this._format.set(this.format);
    if (changes['emitDateObjects']) this._emitDateObjects.set(this.emitDateObjects);
  }

  // Getter methods for @Input properties
  getStartDate = (): Date | null => this._startDate();
  getEndDate = (): Date | null => this._endDate();
  getMinDate = (): Date | null => this._minDate();
  getMaxDate = (): Date | null => this._maxDate();
  getDisabledDates = (): Date[] | null => this._disabledDates();
  getLocale = (): string => this._locale();
  getFormat = (): 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD' => this._format();
  getEmitDateObjects = (): boolean => this._emitDateObjects();

  private syncMonthYearFromStartDate(): void {
    // Prefer startDate, else use endDate, else fallback to today
    const date = this.getStartDate() ?? this.getEndDate() ?? null;
    if (date) {
      this.currentMonth.set(date.getMonth());
      this.currentYear.set(date.getFullYear());
    } else {
      const today = new Date();
      this.currentMonth.set(today.getMonth());
      this.currentYear.set(today.getFullYear());
    }
  }

  onMonthChange(event: Event): void {
    const select = event.target as HTMLSelectElement | null;
    if (!select) return;
    const month = Number(select.value);
    if (!isNaN(month)) {
      this.currentMonth.set(month);
      this.cells();
    }
  }

  onYearChange(event: Event): void {
    const select = event.target as HTMLSelectElement | null;
    if (!select) return;
    const year = Number(select.value);
    if (!isNaN(year)) {
      this.currentYear.set(year);
      this.cells();
    }
  }

  private initLocaleLabels(): void {
    try {
      const dfMonth = new Intl.DateTimeFormat(this.getLocale() ?? 'en-US', { month: 'long' });
      const months = [] as string[];
      for (let m = 0; m < 12; m++) {
        months.push(dfMonth.format(new Date(2020, m, 1)));
      }
      this.monthNames = months;

      const dfWeek = new Intl.DateTimeFormat(this.getLocale() ?? 'en-US', {
        weekday: 'short',
      });
      const week = [] as string[];
      for (let d = 0; d < 7; d++) {
        week.push(dfWeek.format(new Date(2020, 5, 7 + d)));
      }
      this.weekDays = week;
    } catch {
      this.monthNames = [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December',
      ];
      this.weekDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
    }
  }

  handleKey(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      event.stopPropagation();
      this.closed.emit();
      return;
    }

    const idx = this.focusedIndex();
    if (idx === null) return;
    let newIdx: number | null = null;

    switch (event.key) {
      case 'ArrowLeft':
        newIdx = idx - 1;
        break;
      case 'ArrowRight':
        newIdx = idx + 1;
        break;
      case 'ArrowUp':
        newIdx = idx - 7;
        break;
      case 'ArrowDown':
        newIdx = idx + 7;
        break;
      case 'PageUp':
        this.prevMonth();
        return;
      case 'PageDown':
        this.nextMonth();
        return;
      case 'Home':
        newIdx = idx - (idx % 7);
        break;
      case 'End':
        newIdx = idx + (6 - (idx % 7));
        break;
      case 'Enter':
        const cells = this.cells();
        if (cells[idx] && !cells[idx].empty && !cells[idx].disabled) {
          this.select(cells[idx]);
        }
        return;
    }

    if (newIdx !== null) {
      const cells = this.cells();
      newIdx = Math.max(0, Math.min(cells.length - 1, newIdx));
      this.focusedIndex.set(newIdx);
      event.preventDefault();
    }
  }

  prevMonth(): void {
    let m = this.currentMonth() - 1,
      y = this.currentYear();
    if (m < 0) {
      m = 11;
      y--;
    }
    this.currentMonth.set(m);
    this.currentYear.set(y);
  }

  nextMonth(): void {
    let m = this.currentMonth() + 1,
      y = this.currentYear();
    if (m > 11) {
      m = 0;
      y++;
    }
    this.currentMonth.set(m);
    this.currentYear.set(y);
  }

  private buildNgccCalendarCells(): NgccCalendarCell[] {
    const year = this.currentYear();
    const month = this.currentMonth();

    const first = new Date(year, month, 1);
    const last = new Date(year, month + 1, 0);

    const firstWeekDay = first.getDay();
    const totalDays = last.getDate();

    const today = new Date();

    const startDate = this.getStartDate();
    const endDate = this.getEndDate();
    const hoverDate = this.hoverDate();
    const minDate = this.getMinDate();
    const maxDate = this.getMaxDate();
    const disabledDates = this.getDisabledDates();

    const strip = (d: Date): number =>
      new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();

    const cells: NgccCalendarCell[] = [];

    // Empty leading cells
    for (let i = 0; i < firstWeekDay; i++) {
      cells.push({ empty: true });
    }

    for (let d = 1; d <= totalDays; d++) {
      const date = new Date(year, month, d);
      const isToday = date.toDateString() === today.toDateString();

      const isStart = startDate !== null && date.getTime() === startDate.getTime();

      const isEnd = endDate !== null && date.getTime() === endDate.getTime();

      let inRange = false;

      if (startDate && endDate && date > startDate && date < endDate) {
        inRange = true;
      }

      if (startDate && hoverDate) {
        if (startDate < hoverDate && date > startDate && date < hoverDate) {
          inRange = true;
        }

        if (hoverDate < startDate && date > hoverDate && date < startDate) {
          inRange = true;
        }
      }

      let disabled = false;

      if (minDate && strip(date) < strip(minDate)) {
        disabled = true;
      }

      if (maxDate && strip(date) > strip(maxDate)) {
        disabled = true;
      }

      if (disabledDates?.some((dd) => dd.toDateString() === date.toDateString())) {
        disabled = true;
      }

      const cellIndex = cells.length;

      cells.push({
        day: d,
        date,
        empty: false,
        isToday,
        isStart,
        isEnd,
        inRange,
        disabled,
        index: cellIndex,
      });
    }

    return cells;
  }

  select(cell: NgccCalendarCell): void {
    if (cell.empty || cell.disabled) return;
    if (cell?.date) this.dateSelected.emit(cell.date);
  }

  setHover(d: Date | null): void {
    this.hoverDate.set(d ?? null);
  }

  clearHover(): void {
    this.hoverDate.set(null);
  }

  goToToday(): void {
    const d = new Date();
    this.currentMonth.set(d.getMonth());
    this.currentYear.set(d.getFullYear());
    const todayIndex = this.cells().findIndex((c) => !c.empty && c.isToday && !c.disabled);
    if (todayIndex >= 0) this.focusedIndex.set(todayIndex);
  }
}
