import {
  ChangeDetectionStrategy,
  Component,
  computed,
  signal,
  Optional,
  Self,
  effect,
  inject,
  ElementRef,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges,
  AfterViewInit,
} from '@angular/core';
import { ControlValueAccessor, NgControl } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NgccIcon } from '../ngcc-icons/ngcc-icon';

@Component({
  selector: 'ngcc-checkbox',
  standalone: true,
  imports: [CommonModule, NgccIcon],
  templateUrl: './ngcc-checkbox.html',
  styleUrls: ['./ngcc-checkbox.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': 'hostClasses()',
  },
})
export class NgccCheckbox implements ControlValueAccessor, OnChanges, AfterViewInit {
  // Inputs
  @Input() label: string | undefined = 'checkbox';
  @Input() required = false;
  @Input() disabled = false;
  @Input() skeleton = false;
  @Input() helperText: string | undefined = undefined;
  @Input() ariaLabel: string | undefined = undefined;
  @Input() ariaLabelledBy: string | undefined = undefined;
  @Input() indeterminate = false;
  @Input() invalid: boolean | undefined = undefined;
  @Input() errorMessage: string | undefined = undefined;
  @Input() checked = false;

  // Outputs
  @Output() checkedChange = new EventEmitter<boolean>();
  @Output() change = new EventEmitter<boolean>();

  // Internal state signals
  private readonly _label = signal<string | undefined>('checkbox');
  private readonly _required = signal(false);
  private readonly _disabled = signal(false);
  private readonly _skeleton = signal(false);
  private readonly _helperText = signal<string | undefined>(undefined);
  private readonly _ariaLabel = signal<string | undefined>(undefined);
  private readonly _ariaLabelledBy = signal<string | undefined>(undefined);
  private readonly _indeterminate = signal(false);
  private readonly _invalid = signal<boolean | undefined>(undefined);
  private readonly _errorMessage = signal<string | undefined>(undefined);
  private readonly _checked = signal(false);

  // CVA disabled override
  private readonly _disabledByForm = signal(false);
  readonly isDisabled = computed(() => this._disabled() || this._disabledByForm());

  // Internal
  private static idCounter = 0;
  readonly inputId = `ngcc-checkbox-${NgccCheckbox.idCounter++}`;
  private readonly el = inject(ElementRef<HTMLInputElement>);

  constructor(@Optional() @Self() private ngcontrol: NgControl) {
    if (this.ngcontrol) {
      this.ngcontrol.valueAccessor = this;
    }
    effect(() => {
      const input = this.el.nativeElement.querySelector('input');
      if (input) {
        input.indeterminate = !!this._indeterminate();
      }
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['label']) this._label.set(changes['label'].currentValue ?? 'checkbox');
    if (changes['required']) this._required.set(changes['required'].currentValue ?? false);
    if (changes['disabled']) this._disabled.set(changes['disabled'].currentValue ?? false);
    if (changes['skeleton']) this._skeleton.set(changes['skeleton'].currentValue ?? false);
    if (changes['helperText'])
      this._helperText.set(changes['helperText'].currentValue ?? undefined);
    if (changes['ariaLabel']) this._ariaLabel.set(changes['ariaLabel'].currentValue ?? undefined);
    if (changes['ariaLabelledBy'])
      this._ariaLabelledBy.set(changes['ariaLabelledBy'].currentValue ?? undefined);
    if (changes['indeterminate'])
      this._indeterminate.set(changes['indeterminate'].currentValue ?? false);
    if (changes['invalid']) this._invalid.set(changes['invalid'].currentValue ?? undefined);
    if (changes['errorMessage'])
      this._errorMessage.set(changes['errorMessage'].currentValue ?? undefined);
    if (changes['checked']) this._checked.set(changes['checked'].currentValue ?? false);
  }

  ngAfterViewInit(): void {
    // Initial sync for SSR/first render
    const input = this.el.nativeElement.querySelector('input');
    if (input) input.indeterminate = !!this._indeterminate();
  }

  // --- Computed ---
  readonly describedBy = computed(() => (this._helperText() ? `${this.inputId}-helper` : null));

  readonly labelledBy = computed(() => {
    const parts: string[] = [];
    if (this._label()) parts.push(`${this.inputId}-label`);
    if (this._helperText() && !this.invalid_value()) parts.push(`${this.inputId}-helper`);
    if (this.invalid_value()) parts.push(`${this.inputId}-error`);
    return parts.join(' ') || null;
  });

  readonly computedAriaLabel = computed(() => {
    return this._ariaLabel() ?? this._label() ?? 'checkbox';
  });

  readonly invalid_value = computed(() => {
    // If prop is explicitly set → take priority
    if (this._invalid() !== undefined) return this._invalid();

    // Else use reactive form validation
    const control = this.ngcontrol?.control;
    return !!control?.invalid && (control?.touched || control?.dirty);
  });

  readonly hostClasses = computed(() => {
    return [
      'cds--form-item cds--checkbox-wrapper',
      this.invalid_value() ? 'cds--checkbox-wrapper--invalid' : '',
      this.isDisabled() ? 'cds--checkbox-wrapper--disabled' : '',
      this._skeleton() ? 'cds--checkbox-skeleton' : '',
    ].join(' ');
  });

  // --- Events ---
  onToggle(event: Event): void {
    const val = (event.target as HTMLInputElement).checked;
    // clear indeterminate when toggled
    if (this._indeterminate()) {
      this._indeterminate.set(false);
    }

    this._checked.set(val);
    this.onChangeFn(val);
    this.onTouchedFn();
    this.change.emit(val);
    this.checkedChange.emit(val);
  }

  onBlur(): void {
    this.onTouchedFn();
    this.ngcontrol?.control?.markAsTouched();
  }

  // --- CVA ---
  private onChangeFn: (val: boolean) => void = () => {};
  private onTouchedFn: () => void = () => {};

  writeValue(val: boolean): void {
    this._checked.set(val ?? false);
  }

  registerOnChange(fn: (val: boolean) => void): void {
    this.onChangeFn = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouchedFn = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this._disabledByForm.set(isDisabled);
  }

  // Template accessors for signals
  getChecked(): boolean {
    return this._checked();
  }
}
