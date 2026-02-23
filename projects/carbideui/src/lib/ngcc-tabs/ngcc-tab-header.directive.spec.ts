import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideZonelessChangeDetection } from '@angular/core';
import { NgccTabHeaderDirective } from './ngcc-tab-header.directive';
import { NgccTab } from './ngcc-tab';

// ─────────────────────────────────────────────
// Test Host
// ─────────────────────────────────────────────

@Component({
  template: `
    <button
      ngccTabHeader
      [active]="active()"
      [disabled]="disabled()"
      [cacheActive]="cacheActive()"
      [paneTabIndex]="paneTabIndex()"
      [paneReference]="paneRef()"
      [title]="title()"
      (selected)="onSelected()"
    >
      {{ label }}
    </button>
  `,
  standalone: true,
  imports: [NgccTabHeaderDirective],
})
class TabHeaderHost {
  active = signal(false);
  disabled = signal(false);
  cacheActive = signal(false);
  paneTabIndex = signal<number | null>(0);
  paneRef = signal<NgccTab | null>(null);
  title = signal<string | null>(null);
  label = 'Tab 1';
  onSelected = vi.fn();
}

// ─────────────────────────────────────────────
// Test Suite
// ─────────────────────────────────────────────

describe('NgccTabHeaderDirective', () => {
  let fixture: ComponentFixture<TabHeaderHost>;
  let host: TabHeaderHost;
  let button: HTMLButtonElement;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TabHeaderHost],
      providers: [provideZonelessChangeDetection()],
    });

    fixture = TestBed.createComponent(TabHeaderHost);
    host = fixture.componentInstance;
    button = fixture.debugElement.query(By.css('button')).nativeElement;
  });

  // ─────────────────────────────────────────────
  // Core Behavior
  // ─────────────────────────────────────────────

  describe('Core Behavior', () => {
    it('should render as a tab button', () => {
      fixture.detectChanges();
      expect(button.getAttribute('role')).toBe('tab');
      expect(button.getAttribute('type')).toBe('button');
    });

    it('should emit selected when clicked', () => {
      fixture.detectChanges();
      button.click();
      expect(host.onSelected).toHaveBeenCalled();
    });

    it('should not emit selected when disabled', () => {
      host.disabled.set(true);
      fixture.detectChanges();

      button.click();
      expect(host.onSelected).not.toHaveBeenCalled();
    });
  });

  // ─────────────────────────────────────────────
  // Active & Disabled State
  // ─────────────────────────────────────────────

  describe('Active & Disabled State', () => {
    it('should apply selected styles when active', () => {
      host.active.set(true);
      fixture.detectChanges();

      expect(button.classList).toContain('cds--tabs__nav-item--selected');
      expect(button.getAttribute('aria-selected')).toBe('true');
      expect(button.getAttribute('tabindex')).toBe('0');
    });

    it('should remove selected styles when inactive', () => {
      fixture.detectChanges();

      expect(button.classList).not.toContain('cds--tabs__nav-item--selected');
      expect(button.getAttribute('aria-selected')).toBe('false');
      expect(button.getAttribute('tabindex')).toBeNull();
    });

    it('should apply disabled styles when disabled', () => {
      host.disabled.set(true);
      fixture.detectChanges();

      expect(button.classList).toContain('cds--tabs__nav-item--disabled');
      expect(button.getAttribute('aria-disabled')).toBe('true');
    });
  });

  // ─────────────────────────────────────────────
  // Pane Synchronization
  // ─────────────────────────────────────────────

  describe('Pane Synchronization', () => {
    it('should sync cacheActive to pane reference', () => {
      const pane = {
        cacheActive: signal(false),
        tabIndex: signal<number | null>(0),
      } as NgccTab;

      host.paneRef.set(pane);
      fixture.detectChanges();

      host.cacheActive.set(true);
      fixture.detectChanges();

      expect(pane.cacheActive()).toBe(true);
    });

    it('should sync tabIndex to pane reference', () => {
      const pane = {
        cacheActive: signal(false),
        tabIndex: signal<number | null>(0),
      } as NgccTab;

      host.paneRef.set(pane);
      fixture.detectChanges();

      host.paneTabIndex.set(5);
      fixture.detectChanges();

      expect(pane.tabIndex()).toBe(5);
    });

    it('should not throw when paneReference is null', () => {
      host.paneRef.set(null);
      fixture.detectChanges();

      expect(() => {
        host.cacheActive.set(true);
        host.paneTabIndex.set(1);
        fixture.detectChanges();
      }).not.toThrow();
    });
  });

  // ─────────────────────────────────────────────
  // Title Handling
  // ─────────────────────────────────────────────

  describe('Title Handling', () => {
    it('should respect explicitly provided title', () => {
      host.title.set('Custom title');
      fixture.detectChanges();

      expect(button.getAttribute('title')).toBe('Custom title');
    });
  });

  // ─────────────────────────────────────────────
  // Accessibility
  // ─────────────────────────────────────────────

  describe('Accessibility', () => {
    it('should have required tab ARIA attributes', () => {
      fixture.detectChanges();

      expect(button.getAttribute('role')).toBe('tab');
      expect(button.getAttribute('aria-selected')).toBe('false');
    });
  });
});
