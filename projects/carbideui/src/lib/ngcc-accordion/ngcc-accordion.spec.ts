import { Component, provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NgccAccordion } from './ngcc-accordion';
import { NgccAccordionItem } from './ngcc-accordion-item';
import { CommonModule } from '@angular/common';
import { AccordionAlign, AccordionSize } from './ngcc-accordion.types';
import { axe } from 'vitest-axe';

@Component({
  standalone: true,
  imports: [CommonModule, NgccAccordion, NgccAccordionItem],
  template: `
    <ngcc-accordion [multi]="multi" [size]="size" [align]="align" #accordion>
      @for (item of items; track item.id || $index) {
        <ngcc-accordion-item
          [title]="item.title"
          [defaultOpen]="item.defaultOpen"
          [disabled]="item.disabled"
        >
          {{ item.content }}
        </ngcc-accordion-item>
      }
    </ngcc-accordion>
  `,
})
class TestHostComponent {
  multi = false;
  size: AccordionSize = 'md';
  align: AccordionAlign = 'start';
  items: Array<{
    title: string;
    content: string;
    defaultOpen?: boolean;
    disabled?: boolean;
    id?: string;
  }> = [];
}

describe('NgccAccordion & NgccAccordionItem', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let host: TestHostComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    host = fixture.componentInstance;
  });

  function detectChanges() {
    fixture.detectChanges();
  }

  function getAccordionItems() {
    return fixture.debugElement.queryAll(By.directive(NgccAccordionItem));
  }

  function getAccordionButtons() {
    return fixture.debugElement.queryAll(By.css('.cds--accordion__heading'));
  }

  describe('Core Functionality & Enterprise States', () => {
    it('should render items with correct roles and structure', () => {
      host.items = [{ title: 'Item 1', content: 'Content 1' }];
      detectChanges();

      const accordion = fixture.debugElement.query(By.directive(NgccAccordion))
        .nativeElement as HTMLElement;
      expect(accordion.getAttribute('role')).toBe('list');
      expect(accordion.classList).toContain('cds--accordion');

      const item = fixture.debugElement.query(By.directive(NgccAccordionItem));
      expect(item.nativeElement.getAttribute('role')).toBe('listitem');
      expect(item.nativeElement.classList).toContain('cds--accordion__item');
    });

    it('should apply size classes to container', () => {
      host.size = 'lg';
      host.items = [{ title: 'A', content: 'A' }];
      detectChanges();
      const accordion = fixture.debugElement.query(By.directive(NgccAccordion)).nativeElement;
      expect(accordion.classList).toContain('cds--accordion--lg');
      expect(accordion.classList).toContain('cds--layout--size-lg');
    });

    it('should apply alignment classes', () => {
      host.align = 'end';
      host.items = [{ title: 'A', content: 'A' }];
      detectChanges();
      const accordion = fixture.debugElement.query(By.directive(NgccAccordion)).nativeElement;
      expect(accordion.classList).toContain('cds--accordion--end');
    });

    it('should toggle an item on click', () => {
      host.items = [{ title: 'Toggle', content: 'Content' }];
      detectChanges();

      const button = getAccordionButtons()[0].nativeElement;
      expect(button.getAttribute('aria-expanded')).toBe('false');

      button.click();
      detectChanges();
      expect(button.getAttribute('aria-expanded')).toBe('true');

      const itemEl = getAccordionItems()[0].nativeElement;
      expect(itemEl.classList).toContain('cds--accordion__item--active');
    });

    it('should respect disabled state', () => {
      host.items = [{ title: 'Disabled', content: 'C', disabled: true }];
      detectChanges();

      const button = getAccordionButtons()[0].nativeElement;
      expect(button.disabled).toBe(true);

      button.click();
      detectChanges();
      expect(button.getAttribute('aria-expanded')).toBe('false');
    });

    it('should support single-open mode (multi=false)', () => {
      host.multi = false;
      host.items = [
        { title: 'Item 1', content: 'C1' },
        { title: 'Item 2', content: 'C2' },
      ];
      detectChanges();

      const buttons = getAccordionButtons();
      buttons[0].nativeElement.click();
      detectChanges();
      expect(buttons[0].nativeElement.getAttribute('aria-expanded')).toBe('true');

      buttons[1].nativeElement.click();
      detectChanges();
      expect(buttons[1].nativeElement.getAttribute('aria-expanded')).toBe('true');
      expect(buttons[0].nativeElement.getAttribute('aria-expanded')).toBe('false');
    });

    it('should support multi-open mode (multi=true)', () => {
      host.multi = true;
      host.items = [
        { title: 'Item 1', content: 'C1' },
        { title: 'Item 2', content: 'C2' },
      ];
      detectChanges();

      const buttons = getAccordionButtons();
      buttons[0].nativeElement.click();
      detectChanges();
      buttons[1].nativeElement.click();
      detectChanges();

      expect(buttons[0].nativeElement.getAttribute('aria-expanded')).toBe('true');
      expect(buttons[1].nativeElement.getAttribute('aria-expanded')).toBe('true');
    });
  });

  describe('Programmatic API', () => {
    it('should open and close items programmatically', () => {
      host.items = [{ title: 'Item 1', content: 'C1', id: 'remote' }];
      detectChanges();

      const accordionComp = fixture.debugElement.query(By.directive(NgccAccordion))
        .componentInstance as NgccAccordion;
      const item = getAccordionItems()[0].componentInstance as NgccAccordionItem;
      const itemId = item.id;

      accordionComp.openItem(itemId);
      detectChanges();
      expect(item.buttonId).toBeTruthy();
      expect(getAccordionButtons()[0].nativeElement.getAttribute('aria-expanded')).toBe('true');

      accordionComp.closeItem(itemId);
      detectChanges();
      expect(getAccordionButtons()[0].nativeElement.getAttribute('aria-expanded')).toBe('false');
    });
  });

  describe('WCAG & Accessibility', () => {
    it('should have valid ARIA connections', () => {
      host.items = [{ title: 'Connections', content: 'Check tags' }];
      detectChanges();

      const button = getAccordionButtons()[0].nativeElement;
      const content = fixture.debugElement.query(By.css('.cds--accordion__wrapper')).nativeElement;

      expect(button.getAttribute('aria-controls')).toBe(content.getAttribute('id'));
      expect(content.getAttribute('aria-labelledby')).toBe(button.getAttribute('id'));
      expect(content.getAttribute('role')).toBe('region');
    });

    it('should handle keyboard navigation (Arrows, Home, End)', () => {
      host.items = [
        { title: 'A', content: 'A' },
        { title: 'B', content: 'B' },
      ];
      detectChanges();

      const buttons = getAccordionButtons().map((b) => b.nativeElement);
      buttons[0].focus();

      buttons[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
      detectChanges();
      expect(document.activeElement).toBe(buttons[1]);

      buttons[1].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp' }));
      detectChanges();
      expect(document.activeElement).toBe(buttons[0]);

      buttons[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'End' }));
      detectChanges();
      expect(document.activeElement).toBe(buttons[1]);

      buttons[1].dispatchEvent(new KeyboardEvent('keydown', { key: 'Home' }));
      detectChanges();
      expect(document.activeElement).toBe(buttons[0]);
    });

    it('should ignore keyboard navigation when disabled', () => {
      host.items = [{ title: 'Disabled', content: 'C', disabled: true }];
      detectChanges();
      const button = getAccordionButtons()[0].nativeElement;
      const event = new KeyboardEvent('keydown', { key: 'ArrowDown' });
      const spy = vi.spyOn(event, 'preventDefault');

      button.dispatchEvent(event);
      expect(spy).not.toHaveBeenCalled();
    });

    it('should toggle on Enter and Space', () => {
      host.items = [{ title: 'Keys', content: 'C' }];
      detectChanges();

      const button = getAccordionButtons()[0].nativeElement;
      button.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
      detectChanges();
      expect(button.getAttribute('aria-expanded')).toBe('true');

      button.dispatchEvent(new KeyboardEvent('keydown', { key: ' ' }));
      detectChanges();
      expect(button.getAttribute('aria-expanded')).toBe('false');
    });

    it('should have no accessibility violations', async () => {
      host.items = [
        { title: 'Item 1', content: 'Content 1' },
        { title: 'Item 2', content: 'Content 2', defaultOpen: true },
      ];
      detectChanges();
      const results = await axe(fixture.nativeElement);
      expect(results).toHaveNoViolations();
    });

    it('should ignore toggling when disabled', () => {
      host.items = [{ title: 'Disabled', content: 'C', disabled: true }];
      detectChanges();
      const item = getAccordionItems()[0].componentInstance as NgccAccordionItem;
      const spy = vi.spyOn(item.toggled, 'emit');

      item.toggle();
      expect(item.id).toBeTruthy(); // Just to access something
      expect(spy).not.toHaveBeenCalled();
    });

    it('should handle onKeydown when detached from parent', () => {
      host.items = [{ title: 'Detached', content: 'C' }];
      detectChanges();
      const itemEl = getAccordionItems()[0].nativeElement as HTMLElement;
      const item = getAccordionItems()[0].componentInstance as NgccAccordionItem;

      // Detach from parent
      itemEl.remove();

      const event = new KeyboardEvent('keydown', { key: 'ArrowDown' });
      item.onKeydown(event);
      // Should not throw and return early
      expect(item.id).toBeTruthy();
    });
  });
});
