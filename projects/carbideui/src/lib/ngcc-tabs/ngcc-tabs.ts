import {
  Component,
  Input,
  OnChanges,
  SimpleChanges,
  contentChildren,
  computed,
  ViewChild,
  TemplateRef,
  effect,
  Injector,
  inject,
  signal,
  AfterViewInit,
  ChangeDetectionStrategy,
} from '@angular/core';
import { NgccTabHeaders } from './ngcc-tab-headers';
import { NgccTabsSkeleton } from './ngcc-tab-skeleton';
import { NgccTab } from './ngcc-tab';
import { CommonModule } from '@angular/common';
import { NgccTabPosition, NgccTabType } from './ngcc-tabs.types';

@Component({
  selector: 'ngcc-tabs',
  standalone: true,
  imports: [NgccTabHeaders, NgccTabsSkeleton, CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (getSkeleton()) {
      <ngcc-tabs-skeleton />
    } @else {
      @if (getPosition() === 'top') {
        <ngcc-tab-headers
          [tabInput]="tabs()"
          [ariaLabel]="getAriaLabel()"
          [ariaLabelledBy]="getAriaLabelledBy()"
          [cacheActive]="getCacheActive()"
          [followFocus]="getFollowFocus()"
          [type]="getType()"
          [contentBefore]="beforeTpl()"
          [contentAfter]="afterTpl()"
          [routerIntegration]="getRouterIntegration()"
        />
      }
      <ng-content></ng-content>

      <ng-template #before>
        <ng-content select="[before]" />
      </ng-template>

      <ng-template #after>
        <ng-content select="[after]" />
      </ng-template>

      @if (getPosition() === 'bottom') {
        <ngcc-tab-headers
          [tabInput]="tabs()"
          [ariaLabel]="getAriaLabel()"
          [ariaLabelledBy]="getAriaLabelledBy()"
          [cacheActive]="getCacheActive()"
          [followFocus]="getFollowFocus()"
          [type]="getType()"
          [contentBefore]="beforeTpl()"
          [contentAfter]="afterTpl()"
          [routerIntegration]="getRouterIntegration()"
        />
      }
    }
  `,
})
export class NgccTabs implements AfterViewInit, OnChanges {
  // @Input properties
  @Input() position: NgccTabPosition = 'top';
  @Input() cacheActive = false;
  @Input() followFocus = true;
  @Input() isNavigation = false;
  @Input('aria-label') ariaLabel: string | undefined = undefined;
  // eslint-disable-next-line @angular-eslint/no-input-rename
  @Input('aria-labelledby') ariaLabelledBy: string | undefined = undefined;
  @Input() type: NgccTabType = 'line';
  @Input() skeleton = false;
  @Input() routerIntegration = true;

  // Internal signals
  private readonly _position = signal<NgccTabPosition>('top');
  private readonly _cacheActive = signal(false);
  private readonly _followFocus = signal(true);
  private readonly _isNavigation = signal(false);
  private readonly _ariaLabel = signal<string | undefined>(undefined);
  private readonly _ariaLabelledBy = signal<string | undefined>(undefined);
  private readonly _type = signal<NgccTabType>('line');
  private readonly _skeleton = signal(false);
  private readonly _routerIntegration = signal(true);

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['position']) this._position.set(changes['position'].currentValue ?? 'top');
    if (changes['cacheActive']) this._cacheActive.set(changes['cacheActive'].currentValue ?? false);
    if (changes['followFocus']) this._followFocus.set(changes['followFocus'].currentValue ?? true);
    if (changes['isNavigation'])
      this._isNavigation.set(changes['isNavigation'].currentValue ?? false);
    if (changes['ariaLabel']) this._ariaLabel.set(changes['ariaLabel'].currentValue);
    if (changes['ariaLabelledBy']) this._ariaLabelledBy.set(changes['ariaLabelledBy'].currentValue);
    if (changes['type']) this._type.set(changes['type'].currentValue ?? 'line');
    if (changes['skeleton']) this._skeleton.set(changes['skeleton'].currentValue ?? false);
    if (changes['routerIntegration'])
      this._routerIntegration.set(changes['routerIntegration'].currentValue ?? true);
  }

  // Template accessor methods
  getPosition(): NgccTabPosition {
    return this._position();
  }
  getCacheActive(): boolean {
    return this._cacheActive();
  }
  getFollowFocus(): boolean {
    return this._followFocus();
  }
  getIsNavigation(): boolean {
    return this._isNavigation();
  }
  getAriaLabel(): string | undefined {
    return this._ariaLabel();
  }
  getAriaLabelledBy(): string | undefined {
    return this._ariaLabelledBy();
  }
  getType(): NgccTabType {
    return this._type();
  }
  getSkeleton(): boolean {
    return this._skeleton();
  }
  getRouterIntegration(): boolean {
    return this._routerIntegration();
  }

  // ----------------------------
  // DI
  // ----------------------------
  private readonly injector = inject(Injector);

  // ----------------------------
  // Content references
  // ----------------------------
  tabs = contentChildren(NgccTab);
  @ViewChild(NgccTabHeaders) tabHeaders!: NgccTabHeaders;
  @ViewChild('before', { static: false }) private beforeTplRef?: TemplateRef<unknown>;
  @ViewChild('after', { static: false }) private afterTplRef?: TemplateRef<unknown>;

  // Use signals for template refs to prevent expression changed errors
  readonly beforeTpl = signal<TemplateRef<unknown> | null>(null);
  readonly afterTpl = signal<TemplateRef<unknown> | null>(null);

  readonly hasTabHeaders = computed(() => (this.tabs()?.length ?? 0) > 0);

  // ----------------------------
  // Constructor - Effect for tabIndex updates
  // ----------------------------
  constructor() {
    // Use effect() to reactively update tabIndex when tabs or isNavigation changes
    // This follows Angular v20 zoneless best practices
    effect(
      () => {
        const tabs = this.tabs();
        const isNav = this.getIsNavigation();

        if (tabs && tabs.length) {
          tabs.forEach((tab) => {
            tab.tabIndex.set(isNav ? 0 : null);
          });
        }
      },
      { injector: this.injector },
    );
  }

  ngAfterViewInit(): void {
    // Update signal-based template refs after view init
    if (this.beforeTplRef) {
      this.beforeTpl.set(this.beforeTplRef);
    }
    if (this.afterTplRef) {
      this.afterTpl.set(this.afterTplRef);
    }
  }
}
