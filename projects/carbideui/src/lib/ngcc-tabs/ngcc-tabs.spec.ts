import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { provideZonelessChangeDetection } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { Subject } from 'rxjs';
import { NgccTabs } from './ngcc-tabs';
import { NgccTab } from './ngcc-tab';
import { NgccTabHeaders } from './ngcc-tab-headers';
import { NgccTabsSkeleton } from './ngcc-tab-skeleton';
import { axe } from 'vitest-axe';
import { NgccTabType, NgccTabPosition } from './ngcc-tabs.types';

// ─────────────────────────────────────────────
// Test Host Components
// ─────────────────────────────────────────────

@Component({
  template: `
    <ngcc-tabs
      [followFocus]="followFocus"
      [isNavigation]="isNavigation"
      [type]="type"
      [position]="position"
      [cacheActive]="cacheActive"
      [skeleton]="skeleton"
      [aria-label]="ariaLabel"
    >
      <ngcc-tab heading="Tab 1" (selected)="onSelected()">Tab Content 1</ngcc-tab>
      <ngcc-tab heading="Tab 2">Tab Content 2</ngcc-tab>
      <ngcc-tab heading="Tab 3">Tab Content 3</ngcc-tab>
    </ngcc-tabs>
  `,
  standalone: true,
  imports: [CommonModule, NgccTabs, NgccTab],
})
class TabsTestHost {
  isNavigation = true;
  followFocus = true;
  type: NgccTabType = 'line';
  position: NgccTabPosition = 'top';
  cacheActive = false;
  skeleton = false;
  ariaLabel: string | undefined = 'Test tabs';
  onSelected = vi.fn();
}

@Component({
  template: `
    <ngcc-tabs [aria-label]="'Disabled tabs'">
      <ngcc-tab heading="Active Tab">Active Content</ngcc-tab>
      <ngcc-tab heading="Disabled Tab" [disabled]="true">Disabled Content</ngcc-tab>
      <ngcc-tab heading="Another Tab">Another Content</ngcc-tab>
    </ngcc-tabs>
  `,
  standalone: true,
  imports: [CommonModule, NgccTabs, NgccTab],
})
class DisabledTabsTestHost {}

@Component({
  template: `
    <ngcc-tabs [aria-label]="'Single tab'">
      <ngcc-tab heading="Only Tab">Only Content</ngcc-tab>
    </ngcc-tabs>
  `,
  standalone: true,
  imports: [CommonModule, NgccTabs, NgccTab],
})
class SingleTabTestHost {}

@Component({
  template: `
    <ngcc-tabs [isNavigation]="false" [aria-label]="'Nav false tabs'">
      <ngcc-tab heading="Tab A">Content A</ngcc-tab>
      <ngcc-tab heading="Tab B">Content B</ngcc-tab>
    </ngcc-tabs>
  `,
  standalone: true,
  imports: [CommonModule, NgccTabs, NgccTab],
})
class NavFalseTestHost {}

// ─────────────────────────────────────────────
// Test Suite
// ─────────────────────────────────────────────

describe('NgccTabs', () => {
  let fixture: ComponentFixture<TabsTestHost>;
  let host: TabsTestHost;

  const arrowRight = new KeyboardEvent('keydown', { key: 'ArrowRight' });
  const arrowLeft = new KeyboardEvent('keydown', { key: 'ArrowLeft' });
  const homeKey = new KeyboardEvent('keydown', { key: 'Home' });
  const endKey = new KeyboardEvent('keydown', { key: 'End' });
  const spaceKey = new KeyboardEvent('keydown', { key: ' ' });

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        TabsTestHost,
        DisabledTabsTestHost,
        SingleTabTestHost,
        NavFalseTestHost,
        NgccTabs,
        NgccTab,
        NgccTabHeaders,
        NgccTabsSkeleton,
      ],
      providers: [provideZonelessChangeDetection()],
    });

    fixture = TestBed.createComponent(TabsTestHost);
    host = fixture.componentInstance;
    // fixture.detectChanges();
  });

  function getTabsElement() {
    return fixture.debugElement.query(By.css('ngcc-tabs'));
  }

  function getHeaders() {
    return fixture.debugElement.query(By.css('ngcc-tab-headers'));
  }

  function getTabButtons() {
    return fixture.debugElement.queryAll(By.css('[role="tab"]'));
  }

  function getTabPanels() {
    return fixture.debugElement.queryAll(By.css('[role="tabpanel"]'));
  }

  // ─────────────────────────────────────────────
  // Core Functionality (Positive Tests)
  // ─────────────────────────────────────────────

  describe('Core Functionality', () => {
    it('should create an NgccTabs instance', () => {
      expect(getTabsElement().componentInstance).toBeInstanceOf(NgccTabs);
    });

    it('should render the correct number of tabs', () => {
      const tabs = getTabsElement().componentInstance.tabs();
      expect(tabs.length).toBe(3);
    });

    it('should render tab buttons with correct headings', () => {
      fixture.detectChanges();
      const buttons = getTabButtons();
      expect(buttons[0].nativeElement.textContent.trim()).toBe('Tab 1');
      expect(buttons[1].nativeElement.textContent.trim()).toBe('Tab 2');
      expect(buttons[2].nativeElement.textContent.trim()).toBe('Tab 3');
    });

    it('should set the first tab as active by default', () => {
      fixture.detectChanges();
      const tabs = getTabsElement().componentInstance.tabs();
      expect(tabs[0].active()).toBe(true);
      expect(tabs[1].active()).toBe(false);
      expect(tabs[2].active()).toBe(false);
    });

    it('should select a tab on click', () => {
      fixture.detectChanges();
      const buttons = getTabButtons();
      buttons[1].nativeElement.click();
      fixture.detectChanges();

      const tabs = getTabsElement().componentInstance.tabs();
      expect(tabs[0].active()).toBe(false);
      expect(tabs[1].active()).toBe(true);
    });

    it('should emit the selected event on click', () => {
      fixture.detectChanges();
      const navItem = fixture.nativeElement.querySelector('.cds--tabs__nav-item');
      navItem.click();
      fixture.detectChanges();

      expect(host.onSelected).toHaveBeenCalled();
    });

    it('should deactivate previous tab when a new tab is selected', () => {
      fixture.detectChanges();
      const buttons = getTabButtons();
      const tabs = getTabsElement().componentInstance.tabs();

      buttons[1].nativeElement.click();
      fixture.detectChanges();

      expect(tabs[0].active()).toBe(false);
      expect(tabs[1].active()).toBe(true);

      buttons[2].nativeElement.click();
      fixture.detectChanges();

      expect(tabs[1].active()).toBe(false);
      expect(tabs[2].active()).toBe(true);
    });

    it('should generate unique IDs for each tab', () => {
      const tabs = getTabsElement().componentInstance.tabs();
      const ids = tabs.map((t: NgccTab) => t.id());
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });
  });

  // ─────────────────────────────────────────────
  // Variants & Configuration
  // ─────────────────────────────────────────────

  describe('Variants & Configuration', () => {
    it('should apply "line" type by default', () => {
      fixture.detectChanges();
      const headers = getHeaders();
      expect(headers.nativeElement.classList).toContain('cds--tabs');
      expect(headers.nativeElement.classList).not.toContain('cds--tabs--contained');
    });

    it('should apply "contained" type class', () => {
      host.type = 'contained';
      fixture.detectChanges();

      const headers = getHeaders();
      expect(headers.nativeElement.classList).toContain('cds--tabs--contained');
    });

    it('should render skeleton when skeleton input is true', () => {
      host.skeleton = true;
      fixture.detectChanges();

      const skeleton = fixture.debugElement.query(By.css('ngcc-tabs-skeleton'));
      expect(skeleton).toBeTruthy();

      const headers = fixture.debugElement.query(By.css('ngcc-tab-headers'));
      expect(headers).toBeFalsy();
    });

    it('should render tab headers when skeleton input is false', () => {
      host.skeleton = false;
      fixture.detectChanges();

      const headers = fixture.debugElement.query(By.css('ngcc-tab-headers'));
      expect(headers).toBeTruthy();

      const skeleton = fixture.debugElement.query(By.css('ngcc-tabs-skeleton'));
      expect(skeleton).toBeFalsy();
    });
  });

  // ─────────────────────────────────────────────
  // Keyboard Navigation
  // ─────────────────────────────────────────────

  describe('Keyboard Navigation', () => {
    it('should move focus right with ArrowRight', () => {
      fixture.detectChanges();
      const headers = getHeaders();
      const navItem = fixture.nativeElement.querySelector('.cds--tabs__nav-item');

      navItem.click();
      fixture.detectChanges();
      expect(headers.componentInstance.currentSelectedTab).toBe(0);

      headers.nativeElement.dispatchEvent(arrowRight);
      fixture.detectChanges();
      expect(headers.componentInstance.currentSelectedTab).toBe(1);
    });

    it('should move focus left with ArrowLeft', () => {
      fixture.detectChanges();
      const headers = getHeaders();
      const navItem = fixture.nativeElement.querySelector('.cds--tabs__nav-item');

      navItem.click();
      fixture.detectChanges();

      headers.nativeElement.dispatchEvent(arrowRight);
      headers.nativeElement.dispatchEvent(arrowRight);
      fixture.detectChanges();
      expect(headers.componentInstance.currentSelectedTab).toBe(2);

      headers.nativeElement.dispatchEvent(arrowLeft);
      fixture.detectChanges();
      expect(headers.componentInstance.currentSelectedTab).toBe(1);
    });

    it('should wrap to first tab when pressing ArrowRight on last tab', () => {
      fixture.detectChanges();
      const headers = getHeaders();
      const navItem = fixture.nativeElement.querySelector('.cds--tabs__nav-item');

      navItem.click();
      fixture.detectChanges();

      const tabs = getTabsElement().componentInstance.tabs();
      for (let i = 0; i < tabs.length; i++) {
        headers.nativeElement.dispatchEvent(arrowRight);
      }
      fixture.detectChanges();

      expect(headers.componentInstance.currentSelectedTab).toBe(0);
    });

    it('should wrap to last tab when pressing ArrowLeft on first tab', () => {
      fixture.detectChanges();
      const headers = getHeaders();
      const navItem = fixture.nativeElement.querySelector('.cds--tabs__nav-item');

      navItem.click();
      fixture.detectChanges();

      headers.nativeElement.dispatchEvent(arrowLeft);
      fixture.detectChanges();

      expect(headers.componentInstance.currentSelectedTab).toBe(2);
    });

    it('should move focus to first tab with Home key', () => {
      fixture.detectChanges();
      const headers = getHeaders();
      const navItem = fixture.nativeElement.querySelector('.cds--tabs__nav-item');

      navItem.click();
      fixture.detectChanges();

      headers.nativeElement.dispatchEvent(arrowRight);
      headers.nativeElement.dispatchEvent(arrowRight);
      fixture.detectChanges();
      expect(headers.componentInstance.currentSelectedTab).toBe(2);

      headers.nativeElement.dispatchEvent(homeKey);
      fixture.detectChanges();
      expect(headers.componentInstance.currentSelectedTab).toBe(0);
    });

    it('should move focus to last tab with End key', () => {
      fixture.detectChanges();
      const headers = getHeaders();
      const navItem = fixture.nativeElement.querySelector('.cds--tabs__nav-item');

      navItem.click();
      fixture.detectChanges();

      headers.nativeElement.dispatchEvent(endKey);
      fixture.detectChanges();
      expect(headers.componentInstance.currentSelectedTab).toBe(2);
    });

    it('should select tab with Space key', () => {
      fixture.detectChanges();
      const headers = getHeaders();
      const navItem = fixture.nativeElement.querySelector('.cds--tabs__nav-item');

      navItem.click();
      fixture.detectChanges();

      headers.nativeElement.dispatchEvent(arrowRight);
      fixture.detectChanges();

      headers.nativeElement.dispatchEvent(spaceKey);
      fixture.detectChanges();

      const tabs = getTabsElement().componentInstance.tabs();
      expect(tabs[1].active()).toBe(true);
    });
  });

  // ─────────────────────────────────────────────
  // Disabled Tab Handling (Negative Tests)
  // ─────────────────────────────────────────────

  describe('Disabled Tab Handling', () => {
    it('should not select a disabled tab on click', () => {
      const disabledFixture = TestBed.createComponent(DisabledTabsTestHost);
      disabledFixture.detectChanges();

      const buttons = disabledFixture.debugElement.queryAll(By.css('[role="tab"]'));
      const tabs = disabledFixture.debugElement.query(By.css('ngcc-tabs')).componentInstance.tabs();

      buttons[1].nativeElement.click();
      disabledFixture.detectChanges();

      expect(tabs[1].active()).toBe(false);
    });

    it('should set aria-disabled="true" on disabled tabs', () => {
      const disabledFixture = TestBed.createComponent(DisabledTabsTestHost);
      disabledFixture.detectChanges();

      const buttons = disabledFixture.debugElement.queryAll(By.css('[role="tab"]'));
      expect(buttons[1].nativeElement.getAttribute('aria-disabled')).toBe('true');
    });

    it('should apply disabled CSS class on disabled tabs', () => {
      const disabledFixture = TestBed.createComponent(DisabledTabsTestHost);
      disabledFixture.detectChanges();

      const buttons = disabledFixture.debugElement.queryAll(By.css('[role="tab"]'));
      expect(buttons[1].nativeElement.classList).toContain('cds--tabs__nav-item--disabled');
    });

    it('should not apply disabled CSS class on enabled tabs', () => {
      const disabledFixture = TestBed.createComponent(DisabledTabsTestHost);
      disabledFixture.detectChanges();

      const buttons = disabledFixture.debugElement.queryAll(By.css('[role="tab"]'));
      expect(buttons[0].nativeElement.classList).not.toContain('cds--tabs__nav-item--disabled');
    });
  });

  // ─────────────────────────────────────────────
  // Tab Panel Content
  // ─────────────────────────────────────────────

  describe('Tab Panel Content', () => {
    it('should display content of the active tab', () => {
      fixture.detectChanges();
      const panels = getTabPanels();
      expect(panels.length).toBeGreaterThan(0);

      const visiblePanel = panels.find((p) => p.nativeElement.style.display !== 'none');
      expect(visiblePanel?.nativeElement.textContent.trim()).toBe('Tab Content 1');
    });

    it('should only render active tab panel when cacheActive is false', () => {
      fixture.detectChanges();
      const panels = getTabPanels();
      // With cacheActive=false, only the active tab's panel should be in the DOM
      expect(panels.length).toBe(1);
    });

    it('should switch visible content when a new tab is selected', () => {
      fixture.detectChanges();
      const buttons = getTabButtons();
      buttons[1].nativeElement.click();
      fixture.detectChanges();

      const panels = getTabPanels();
      const visiblePanel = panels.find((p) => p.nativeElement.style.display !== 'none');
      expect(visiblePanel?.nativeElement.textContent.trim()).toBe('Tab Content 2');
    });
  });

  // ─────────────────────────────────────────────
  // Navigation Mode (tabIndex handling)
  // ─────────────────────────────────────────────

  describe('Navigation Mode', () => {
    it('should set tabIndex to 0 on all tab panels when isNavigation is true', () => {
      const tabs = getTabsElement().componentInstance.tabs();
      tabs.forEach((tab: NgccTab) => {
        expect(tab.tabIndex()).toBe(0);
      });
    });

    it('should set tabIndex to null on all tab panels when isNavigation is false', () => {
      const navFalseFixture = TestBed.createComponent(NavFalseTestHost);
      navFalseFixture.detectChanges();

      const tabs = navFalseFixture.debugElement.query(By.css('ngcc-tabs')).componentInstance.tabs();
      tabs.forEach((tab: NgccTab) => {
        expect(tab.tabIndex()).toBeNull();
      });
    });
  });

  // ─────────────────────────────────────────────
  // Edge Cases (Negative Tests)
  // ─────────────────────────────────────────────

  describe('Edge Cases', () => {
    it('should handle single tab correctly', () => {
      const singleFixture = TestBed.createComponent(SingleTabTestHost);
      singleFixture.detectChanges();

      const tabs = singleFixture.debugElement.query(By.css('ngcc-tabs')).componentInstance.tabs();
      expect(tabs.length).toBe(1);
      expect(tabs[0].active()).toBe(true);
    });

    it('should not break when clicking the already active tab', () => {
      fixture.detectChanges();
      const buttons = getTabButtons();
      const tabs = getTabsElement().componentInstance.tabs();

      buttons[0].nativeElement.click();
      fixture.detectChanges();

      expect(tabs[0].active()).toBe(true);
    });

    it('should handle rapid sequential tab clicks', () => {
      fixture.detectChanges();
      const buttons = getTabButtons();
      const tabs = getTabsElement().componentInstance.tabs();

      buttons[1].nativeElement.click();
      buttons[2].nativeElement.click();
      buttons[0].nativeElement.click();
      fixture.detectChanges();

      expect(tabs[0].active()).toBe(true);
      expect(tabs[1].active()).toBe(false);
      expect(tabs[2].active()).toBe(false);
    });
  });

  // ─────────────────────────────────────────────
  // WCAG & Accessibility
  // ─────────────────────────────────────────────

  describe('WCAG & Accessibility', () => {
    it('should have no accessibility violations (axe)', async () => {
      const results = await axe(fixture.nativeElement);
      expect(results).toHaveNoViolations();
    });

    it('should have a tablist role on the tab list container', () => {
      fixture.detectChanges();
      const tablist = fixture.debugElement.query(By.css('[role="tablist"]'));
      expect(tablist).toBeTruthy();
    });

    it('should have role="tab" on each tab button', () => {
      fixture.detectChanges();
      const buttons = getTabButtons();
      expect(buttons.length).toBe(3);
      buttons.forEach((btn) => {
        expect(btn.nativeElement.getAttribute('role')).toBe('tab');
      });
    });

    it('should have role="tabpanel" on each tab panel', () => {
      fixture.detectChanges();
      const panels = getTabPanels();
      expect(panels.length).toBeGreaterThan(0);
      panels.forEach((panel) => {
        expect(panel.nativeElement.getAttribute('role')).toBe('tabpanel');
      });
    });

    it('should set aria-selected="true" only on the active tab', () => {
      fixture.detectChanges();
      const buttons = getTabButtons();
      expect(buttons[0].nativeElement.getAttribute('aria-selected')).toBe('true');
      expect(buttons[1].nativeElement.getAttribute('aria-selected')).toBe('false');
      expect(buttons[2].nativeElement.getAttribute('aria-selected')).toBe('false');
    });

    it('should update aria-selected when a different tab is clicked', () => {
      fixture.detectChanges();
      const buttons = getTabButtons();
      buttons[1].nativeElement.click();
      fixture.detectChanges();

      expect(buttons[0].nativeElement.getAttribute('aria-selected')).toBe('false');
      expect(buttons[1].nativeElement.getAttribute('aria-selected')).toBe('true');
    });

    it('should set aria-controls linking tab to its panel', () => {
      const buttons = getTabButtons();
      const tabs = getTabsElement().componentInstance.tabs();

      buttons.forEach((btn: any, i: number) => {
        const tabId = tabs[i].id();
        expect(btn.nativeElement.getAttribute('aria-controls')).toBe(tabId);
      });
    });

    it('should set aria-labelledby on tab panels linking back to their tab header', () => {
      const panels = getTabPanels();
      panels.forEach((panel) => {
        const labelledBy = panel.nativeElement.getAttribute('aria-labelledby');
        expect(labelledBy).toBeTruthy();
        expect(labelledBy).toContain('-header');
      });
    });

    it('should set tabindex="0" only on the active tab button', () => {
      fixture.detectChanges();
      const buttons = getTabButtons();
      expect(buttons[0].nativeElement.getAttribute('tabindex')).toBe('0');
      expect(buttons[1].nativeElement.getAttribute('tabindex')).toBeNull();
      expect(buttons[2].nativeElement.getAttribute('tabindex')).toBeNull();
    });

    it('should have aria-live="polite" on tab panels', () => {
      const panels = getTabPanels();
      panels.forEach((panel) => {
        expect(panel.nativeElement.getAttribute('aria-live')).toBe('polite');
      });
    });

    it('should set aria-label on the tablist container', () => {
      fixture.detectChanges();
      const tablist = fixture.debugElement.query(By.css('[role="tablist"]'));
      expect(tablist.nativeElement.getAttribute('aria-label')).toBe('Test tabs');
    });

    it('should set aria-hidden="true" on overflow navigation SVG icons', () => {
      const svgs = fixture.debugElement.queryAll(By.css('svg'));
      svgs.forEach((svg) => {
        expect(svg.nativeElement.getAttribute('aria-hidden')).toBe('true');
      });
    });

    it('should have type="button" on all tab buttons', () => {
      const buttons = getTabButtons();
      buttons.forEach((btn) => {
        expect(btn.nativeElement.getAttribute('type')).toBe('button');
      });
    });
  });

  // ─────────────────────────────────────────────
  // Skeleton Component
  // ─────────────────────────────────────────────

  describe('NgccTabsSkeleton', () => {
    it('should render default number of skeleton tabs (5)', () => {
      const skeletonFixture = TestBed.createComponent(NgccTabsSkeleton);
      skeletonFixture.detectChanges();

      const items = skeletonFixture.debugElement.queryAll(By.css('.cds--tabs__nav-item'));
      expect(items.length).toBe(5);
    });

    it('should apply skeleton host classes', () => {
      const skeletonFixture = TestBed.createComponent(NgccTabsSkeleton);
      skeletonFixture.detectChanges();

      const el = skeletonFixture.nativeElement;
      expect(el.classList).toContain('cds--tabs');
      expect(el.classList).toContain('cds--skeleton');
    });
  });

  // ─────────────────────────────────────────────
  // Router Integration Tests
  // ─────────────────────────────────────────────

  // ─────────────────────────────────────────────
  // Overflow Navigation Tests
  // ─────────────────────────────────────────────

  describe('Overflow Navigation', () => {
    it('should trigger change detection on scroll', () => {
      fixture.detectChanges();
      const headers = fixture.debugElement.query(By.css('ngcc-tab-headers'));
      const cdrSpy = vi.spyOn(headers.componentInstance['changeDetectorRef'], 'markForCheck');

      headers.componentInstance.handleScroll();

      expect(cdrSpy).toHaveBeenCalled();
    });

    it('should scroll right on next button click', () => {
      fixture.detectChanges();
      const headers = fixture.debugElement.query(By.css('ngcc-tab-headers'));
      const mockElement = {
        scrollLeft: 0,
        scrollWidth: 1000,
        clientWidth: 500,
      };

      Object.defineProperty(headers.componentInstance['headerContainer'], 'nativeElement', {
        value: mockElement,
        writable: true,
      });

      headers.componentInstance.handleOverflowNavClick(1, 3);

      expect(mockElement.scrollLeft).toBeGreaterThan(0);
    });

    it('should scroll left on previous button click', () => {
      fixture.detectChanges();
      const headers = fixture.debugElement.query(By.css('ngcc-tab-headers'));
      const mockElement = {
        scrollLeft: 200,
        scrollWidth: 1000,
        clientWidth: 500,
      };

      Object.defineProperty(headers.componentInstance['headerContainer'], 'nativeElement', {
        value: mockElement,
        writable: true,
      });

      headers.componentInstance.handleOverflowNavClick(-1, 3);

      expect(mockElement.scrollLeft).toBeLessThan(200);
    });

    it('should handle long press for continuous scroll', () => {
      vi.useFakeTimers();
      fixture.detectChanges();

      const headers = fixture.debugElement.query(By.css('ngcc-tab-headers'));
      const mockElement = {
        scrollLeft: 0,
        scrollWidth: 1000,
        clientWidth: 500,
        style: {
          setProperty: vi.fn(),
          removeProperty: vi.fn(),
        },
      };

      Object.defineProperty(headers.componentInstance['headerContainer'], 'nativeElement', {
        value: mockElement,
        writable: true,
      });

      headers.componentInstance.handleOverflowNavMouseDown(1);
      vi.advanceTimersByTime(600);

      expect(headers.componentInstance['tickInterval']).toBeTruthy();

      headers.componentInstance.handleOverflowNavMouseUp();
      vi.useRealTimers();
    });

    it('should stop scrolling on mouse up', () => {
      vi.useFakeTimers();
      fixture.detectChanges();

      const headers = fixture.debugElement.query(By.css('ngcc-tab-headers'));
      const mockElement = {
        scrollLeft: 0,
        scrollWidth: 1000,
        clientWidth: 500,
        style: {
          setProperty: vi.fn(),
          removeProperty: vi.fn(),
        },
      };

      Object.defineProperty(headers.componentInstance['headerContainer'], 'nativeElement', {
        value: mockElement,
        writable: true,
      });

      headers.componentInstance.handleOverflowNavMouseDown(1);
      vi.advanceTimersByTime(600);

      headers.componentInstance.handleOverflowNavMouseUp();

      expect(headers.componentInstance['tickInterval']).toBeFalsy();
      vi.useRealTimers();
    });
  });
});

describe('Router Integration', () => {
  let mockRouter: any;

  @Component({
    template: `
      <ngcc-tabs [routerIntegration]="routerIntegration" [aria-label]="'Router tabs'">
        <ngcc-tab [heading]="t1"></ngcc-tab>
        <ngcc-tab [heading]="t2"></ngcc-tab>
        <ngcc-tab [heading]="t3" [disabled]="true"></ngcc-tab>
      </ngcc-tabs>

      <ng-template #t1><a routerLink="/" href="/">Home</a></ng-template>
      <ng-template #t2><a routerLink="/about" href="/about">About</a></ng-template>
      <ng-template #t3><a routerLink="/contact" href="/contact">Contact</a></ng-template>
    `,
    standalone: true,
    imports: [CommonModule, NgccTabs, NgccTab],
  })
  class RouterTabsTestHost {
    routerIntegration = true;
  }

  beforeEach(() => {
    mockRouter = {
      events: new Subject(),
      isActive: vi.fn().mockReturnValue(false),
      createUrlTree: vi.fn().mockImplementation((commands) => commands),
      serializeUrl: vi
        .fn()
        .mockImplementation((commands) =>
          Array.isArray(commands) ? commands.join('/') : commands,
        ),
    };

    TestBed.configureTestingModule({
      imports: [RouterTabsTestHost, NgccTabs, NgccTab, NgccTabHeaders],
      providers: [provideZonelessChangeDetection(), { provide: Router, useValue: mockRouter }],
    });
  });

  it('should sync active tab with current route on init', async () => {
    mockRouter.isActive.mockImplementation((url: string) => url === '/about');

    const routerFixture = TestBed.createComponent(RouterTabsTestHost);
    routerFixture.detectChanges();
    await new Promise((resolve) => setTimeout(resolve, 100));

    const tabs = routerFixture.debugElement.query(By.css('ngcc-tabs')).componentInstance.tabs();
    expect(tabs[1].active()).toBe(true);
  });

  it('should update active tab when route changes', async () => {
    mockRouter.isActive.mockReturnValue(false);

    const routerFixture = TestBed.createComponent(RouterTabsTestHost);
    routerFixture.detectChanges();
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Simulate navigation to /about
    mockRouter.isActive.mockImplementation((url: string) => url === '/about');
    mockRouter.events.next(new NavigationEnd(1, '/about', '/about'));
    routerFixture.detectChanges();
    await new Promise((resolve) => setTimeout(resolve, 100));

    const tabs = routerFixture.debugElement.query(By.css('ngcc-tabs')).componentInstance.tabs();
    expect(tabs[1].active()).toBe(true);
  });

  it('should skip disabled tabs during sync', async () => {
    mockRouter.isActive.mockImplementation((url: string) => url === '/contact');

    const routerFixture = TestBed.createComponent(RouterTabsTestHost);
    routerFixture.detectChanges();
    await new Promise((resolve) => setTimeout(resolve, 100));

    const tabs = routerFixture.debugElement.query(By.css('ngcc-tabs')).componentInstance.tabs();
    expect(tabs[2].active()).toBe(false);
  });

  it('should not sync when routerIntegration is false', async () => {
    const routerFixture = TestBed.createComponent(RouterTabsTestHost);
    routerFixture.componentInstance.routerIntegration = false;
    mockRouter.isActive.mockImplementation((url: string) => url === '/about');

    routerFixture.detectChanges();
    await new Promise((resolve) => setTimeout(resolve, 100));

    mockRouter.events.next(new NavigationEnd(1, '/about', '/about'));
    routerFixture.detectChanges();
    await new Promise((resolve) => setTimeout(resolve, 100));

    const tabs = routerFixture.debugElement.query(By.css('ngcc-tabs')).componentInstance.tabs();
    expect(tabs[0].active()).toBe(true); // Should still be first tab
  });
});
