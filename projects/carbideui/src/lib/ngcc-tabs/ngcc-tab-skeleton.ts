import {
  Component,
  signal,
  computed,
  Input,
  OnChanges,
  SimpleChanges,
  ChangeDetectionStrategy,
} from '@angular/core';

@Component({
  selector: 'ngcc-tabs-skeleton',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ul class="cds--tabs__nav">
      @for (i of numOfSkeletonTabs(); track $index) {
        <li class="cds--tabs__nav-item">
          <div class="cds--tabs__nav-link">
            <span></span>
          </div>
        </li>
      }
    </ul>
  `,
  host: {
    class: 'cds--tabs cds--skeleton',
  },
})
export class NgccTabsSkeleton implements OnChanges {
  /**
   * Input number of skeleton tabs to render (default 5)
   */
  @Input() numOftabs = 5;

  // Internal state signal
  private readonly _numOftabs = signal(5);

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['numOftabs']) {
      this._numOftabs.set(changes['numOftabs'].currentValue ?? 5);
    }
  }

  /**
   * Computed array to iterate skeleton placeholders
   */
  readonly numOfSkeletonTabs = computed(() => new Array(this._numOftabs()));
}
