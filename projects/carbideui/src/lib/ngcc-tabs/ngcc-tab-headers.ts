import {
  Component,
  Input,
  ChangeDetectionStrategy,
  ContentChildren,
  QueryList,
  ElementRef,
  ViewChildren,
  SimpleChanges,
  OnChanges,
  AfterContentInit,
  OnInit,
  OnDestroy,
  inject,
  signal,
  effect,
  ChangeDetectorRef,
  TemplateRef,
  afterNextRender,
  Injector,
  runInInjectionContext,
  EffectRef,
  AfterViewInit,
  DestroyRef,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NgTemplateOutlet } from '@angular/common';
import { NgccTab } from './ngcc-tab';
import { NgccBaseTabHeader } from './ngcc-base-tab-header';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';

@Component({
  selector: 'ngcc-tab-headers',
  standalone: true,
  imports: [NgTemplateOutlet],
  templateUrl: './ngcc-tab-headers.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(keydown)': 'onKeyDown($event)',
  },
})
export class NgccTabHeaders
  extends NgccBaseTabHeader
  implements OnInit, OnChanges, AfterContentInit, AfterViewInit, OnDestroy
{
  // @Input properties
  @Input() tabInput: readonly NgccTab[] | null = null;
  @Input() routerIntegration = true;

  // Internal signals
  private readonly _tabInput = signal<readonly NgccTab[] | null>(null);
  private readonly _routerIntegration = signal(true);

  getTabInput(): readonly NgccTab[] | null {
    return this._tabInput();
  }
  getRouterIntegration(): boolean {
    return this._routerIntegration();
  }

  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  readonly firstVisibleTab = 0;

  @ContentChildren(NgccTab) private readonly tabQuery!: QueryList<NgccTab>;
  @ViewChildren('tabItem') private readonly allTabHeaders!: QueryList<
    ElementRef<HTMLButtonElement>
  >;

  protected readonly tabs = signal<QueryList<NgccTab> | readonly NgccTab[] | null>(null);
  private resizeObserver!: ResizeObserver;
  private readonly cdr = inject(ChangeDetectorRef);
  private listChangesSub: { unsubscribe?: () => void } | null = null;

  // store injector so we can create DI context for afterNextRender usage in lifecycle hooks
  private readonly injector = inject(Injector);

  // store cleanup handle for the effect
  private destroyEffect?: EffectRef;

  constructor() {
    super();

    // effect returns a cleanup function; store it for ngOnDestroy
    this.destroyEffect = effect(() => {
      const list = this.getTabInput();
      if (list) {
        this.tabs.set(list);
        this.tabsArray.forEach((tab) => tab.cacheActive.set(this.cacheActive()));
        // This is inside constructor (in DI context) so afterNextRender is allowed here.
        runInInjectionContext(this.injector, () => {
          afterNextRender(() => this.setFirstTab());
        });
      }
    });
  }

  ngOnInit(): void {
    this.resizeObserver = new ResizeObserver(() => this.cdr.detectChanges());
    if (this.headerContainer?.nativeElement) {
      this.resizeObserver.observe(this.headerContainer.nativeElement);
    }
  }
  ngAfterViewInit(): void {
    if (!this.getRouterIntegration()) return;

    // Initial sync
    this.syncWithRouter();

    // Continuous sync on navigation events
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => {
        this.syncWithRouter();
      });
  }
  ngAfterContentInit(): void {
    if (!this.tabInput) {
      this.tabs.set(this.tabQuery);
      this.tabsArray.forEach((tab) => tab.cacheActive.set(this.cacheActive()));

      if (this.tabQuery?.changes) {
        this.listChangesSub = this.tabQuery.changes.subscribe(() => {
          this.tabs.set(this.tabQuery);
          // run afterNextRender inside a DI context:
          runInInjectionContext(this.injector, () => {
            afterNextRender(() => this.setFirstTab());
          });
        });
      }
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['cacheActive'] && this.tabs()) {
      this.tabsArray.forEach((tab) => tab.cacheActive.set(this.cacheActive()));
    }
    if (changes['tabInput']) this._tabInput.set(changes['tabInput'].currentValue ?? null);
    if (changes['routerIntegration'])
      this._routerIntegration.set(changes['routerIntegration'].currentValue ?? true);
  }

  private syncWithRouter(): void {
    if (!this.getRouterIntegration()) return;
    const headers = this.allTabHeaders.toArray();
    const tabs = this.tabsArray;

    headers.forEach((el, i) => {
      const link = el.nativeElement.querySelector('a[routerLink]');
      if (!(link instanceof HTMLAnchorElement)) return;

      const href = link.getAttribute('href');

      if (
        href &&
        this.router.isActive(href, {
          paths: 'exact',
          queryParams: 'ignored',
          fragment: 'ignored',
          matrixParams: 'ignored',
        })
      ) {
        // Found active route - select this tab
        if (tabs[i] && !tabs[i].disabled()) {
          this.selectTab(tabs[i], i);
        }
      }
    });
  }

  protected setFirstTab(): void {
    const tabs = this.tabsArray;

    let first = tabs.find((t) => t.active() && !t.disabled());

    if (!first) {
      first = tabs.find((t) => !t.disabled()) ?? undefined;
    }

    tabs.forEach((t) => t.active.set(false));

    if (first) {
      first.active.set(true);
      this.currentSelectedTab = tabs.indexOf(first);
      first.doSelect();
    }
  }

  protected onKeyDown(event: KeyboardEvent): void {
    const tabs = this.tabsArray;
    const current = this.currentSelectedTab;
    const total = tabs.length;
    if (!total) return;

    switch (event.key) {
      case 'ArrowRight':
        event.preventDefault();
        this.moveFocus((current + 1) % total);
        break;
      case 'ArrowLeft':
        event.preventDefault();
        this.moveFocus((current - 1 + total) % total);
        break;
      case 'Home':
        event.preventDefault();
        this.moveFocus(0);
        break;
      case 'End':
        event.preventDefault();
        this.moveFocus(total - 1);
        break;
      case ' ':
      case 'Spacebar':
      case 'Enter':
        event.preventDefault();
        const tab = tabs[current];
        if (!tab.disabled()) {
          this.selectTab(tab, current);
        }
        break;
    }
  }

  selectTab(tab: NgccTab, index: number): void {
    if (tab.disabled()) return;
    this.currentSelectedTab = index;
    this.tabsArray.forEach((t) => t.active.set(false));
    tab.active.set(true);
    tab.doSelect();
  }

  private moveFocus(nextIndex: number): void {
    const tabs = this.tabsArray;
    const headers = this.allTabHeaders.toArray();
    const total = tabs.length;

    let i = nextIndex;

    // Skip disabled tabs
    while (tabs[i]?.disabled()) {
      i = (i + 1) % total;
      if (i === nextIndex) return; // all tabs disabled → bail
    }

    headers[i]?.nativeElement.focus();
    this.currentSelectedTab = i;
  }

  get tabsArray(): NgccTab[] {
    const t = this.tabs();
    if (!t) return [];
    if (Array.isArray(t)) return t;
    if ('toArray' in t && typeof t.toArray === 'function')
      return (t as QueryList<NgccTab>).toArray();
    return [];
  }

  getHeadingTemplate(tab: NgccTab): TemplateRef<unknown> | null {
    const heading = tab.heading();
    return heading instanceof TemplateRef ? heading : null;
  }

  ngOnDestroy(): void {
    this.destroyEffect?.destroy();
    if (this.resizeObserver && this.headerContainer) {
      this.resizeObserver.unobserve(this.headerContainer.nativeElement);
    }
    this.listChangesSub?.unsubscribe?.();
    // Router subscription cleanup handled by takeUntilDestroyed
  }
}
