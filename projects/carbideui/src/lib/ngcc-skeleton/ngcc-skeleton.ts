import {
  ChangeDetectionStrategy,
  Component,
  computed,
  signal,
  Input,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'ngcc-skeleton',
  standalone: true,
  imports: [CommonModule],
  //  encapsulation: ViewEncapsulation.None,
  template: `
    <p
      class="cds--skeleton__text ngcc--skeleton__visual"
      [class.ngcc--skeleton--rounded]="getRounded()"
      [style.width]="computedWidth()"
      [style.height]="computedHeight()"
      [style.--ngcc-radius]="computedRadius()"
    ></p>
  `,
  styleUrls: ['./ngcc-skeleton.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    role: 'status',
    '[attr.aria-busy]': 'true',
    '[attr.aria-label]': `'Loading content'`,
  },
})
export class NgccSkeleton implements OnChanges {
  /** Optional width override (e.g. "100%", "150px") */
  @Input() width: string | null = null;

  /** Optional height override */
  @Input() height: string | null = null;

  @Input() radius: string | null = null;

  /** Rounded style (for avatar-like shapes) */
  @Input() rounded = false;

  // Internal state signals
  private readonly _width = signal<string | null>(null);
  private readonly _height = signal<string | null>(null);
  private readonly _radius = signal<string | null>(null);
  private readonly _rounded = signal(false);

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['width']) this._width.set(changes['width'].currentValue ?? null);
    if (changes['height']) this._height.set(changes['height'].currentValue ?? null);
    if (changes['radius']) this._radius.set(changes['radius'].currentValue ?? null);
    if (changes['rounded']) this._rounded.set(changes['rounded'].currentValue ?? false);
  }

  // Template accessor methods
  getRounded(): boolean {
    return this._rounded();
  }

  /** Normalize value: append "px" if numeric */
  private normalizeSize(value: string | null, fallback: string): string {
    if (!value || value.trim() === '') return fallback;
    const v = value.trim();
    return /^\d+(\.\d+)?$/.test(v) ? `${v}px` : v;
  }

  /** Computed width and height (applied to host + internal element) */
  protected readonly computedWidth = computed(() => this.normalizeSize(this._width(), '100%'));

  protected readonly computedHeight = computed(() => this.normalizeSize(this._height(), '1rem'));

  /** Computed radius (radius > rounded > none) */
  protected readonly computedRadius = computed(() => {
    const radiusVal = this._radius();
    if (radiusVal && radiusVal.trim() !== '') {
      return this.normalizeSize(radiusVal, '4px');
    }
    if (this._rounded()) {
      return '50%';
    }
    return null; // No radius, use default Carbon shape
  });
}
