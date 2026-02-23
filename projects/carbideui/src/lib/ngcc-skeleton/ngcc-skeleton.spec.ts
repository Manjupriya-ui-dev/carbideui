import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NgccSkeleton } from './ngcc-skeleton';
import { provideZonelessChangeDetection } from '@angular/core';
import { axe } from 'vitest-axe';

describe('NgccSkeleton', () => {
  let fixture: ComponentFixture<NgccSkeleton>;
  let component: NgccSkeleton;
  let hostEl: HTMLElement;
  let skeletonEl: HTMLElement;

  const getSkeletonEl = () => hostEl.querySelector('p.cds--skeleton__text') as HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NgccSkeleton],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(NgccSkeleton);
    component = fixture.componentInstance;
    hostEl = fixture.nativeElement as HTMLElement;
    fixture.detectChanges();
    skeletonEl = getSkeletonEl();
  });

  // ───────────────────────────────────────────────────────────────
  // Component Initialization
  // ───────────────────────────────────────────────────────────────
  describe('Component Initialization', () => {
    it('should create the component instance', () => {
      expect(component).toBeTruthy();
    });

    it('should render exactly one skeleton paragraph element', () => {
      const nodes = hostEl.querySelectorAll('p.cds--skeleton__text');
      expect(nodes.length).toBe(1);
    });

    it('should have the Carbon Design System skeleton class', () => {
      expect(skeletonEl.classList.contains('cds--skeleton__text')).toBe(true);
    });

    it('should have the custom visual class', () => {
      expect(skeletonEl.classList.contains('ngcc--skeleton__visual')).toBe(true);
    });
  });

  // ───────────────────────────────────────────────────────────────
  // Dimension Inputs
  // ───────────────────────────────────────────────────────────────
  describe('Dimension Inputs', () => {
    describe('Default Values', () => {
      it('should apply default width of 100%', () => {
        expect(skeletonEl.style.width).toBe('100%');
      });

      it('should apply default height of 1rem', () => {
        expect(skeletonEl.style.height).toBe('1rem');
      });
    });

    describe('Positive Custom Dimensions', () => {
      it('should apply custom width and height in pixels', () => {
        fixture.componentRef.setInput('width', '150px');
        fixture.componentRef.setInput('height', '50px');
        fixture.detectChanges();

        expect(skeletonEl.style.width).toBe('150px');
        expect(skeletonEl.style.height).toBe('50px');
      });

      it('should apply percentage-based dimensions', () => {
        fixture.componentRef.setInput('width', '50%');
        fixture.componentRef.setInput('height', '25%');
        fixture.detectChanges();

        expect(skeletonEl.style.width).toBe('50%');
        expect(skeletonEl.style.height).toBe('25%');
      });

      it('should apply rem/em/viewport units', () => {
        fixture.componentRef.setInput('width', '10rem');
        fixture.componentRef.setInput('height', '5em');
        fixture.detectChanges();

        expect(skeletonEl.style.width).toBe('10rem');
        expect(skeletonEl.style.height).toBe('5em');

        fixture.componentRef.setInput('width', '50vw');
        fixture.componentRef.setInput('height', '10vh');
        fixture.detectChanges();

        expect(skeletonEl.style.width).toBe('50vw');
        expect(skeletonEl.style.height).toBe('10vh');
      });
    });

    describe('Size Normalization (Positive + Negative)', () => {
      it('should auto-append px to numeric width and height', () => {
        fixture.componentRef.setInput('width', '200');
        fixture.componentRef.setInput('height', '40');
        fixture.detectChanges();

        expect(skeletonEl.style.width).toBe('200px');
        expect(skeletonEl.style.height).toBe('40px');
      });

      it('should trim whitespace and normalize values', () => {
        fixture.componentRef.setInput('width', '  150px  ');
        fixture.componentRef.setInput('height', '  20rem  ');
        fixture.detectChanges();

        expect(skeletonEl.style.width).toBe('150px');
        expect(skeletonEl.style.height).toBe('20rem');
      });

      it('should fallback to defaults for null, empty, or whitespace-only values', () => {
        fixture.componentRef.setInput('width', null);
        fixture.componentRef.setInput('height', '');
        fixture.detectChanges();

        expect(skeletonEl.style.width).toBe('100%');
        expect(skeletonEl.style.height).toBe('1rem');

        fixture.componentRef.setInput('width', '   ');
        fixture.componentRef.setInput('height', '   ');
        fixture.detectChanges();

        expect(skeletonEl.style.width).toBe('100%');
        expect(skeletonEl.style.height).toBe('1rem');
      });

      it('should fallback to defaults for invalid CSS values', () => {
        fixture.componentRef.setInput('width', 'nonsense');
        fixture.componentRef.setInput('height', 'invalid-value');
        fixture.detectChanges();

        expect(skeletonEl.style.width).toBe('100%');
        expect(skeletonEl.style.height).toBe('1rem');
      });
    });
  });

  // ───────────────────────────────────────────────────────────────
  // Border Radius
  // ───────────────────────────────────────────────────────────────
  describe('Border Radius', () => {
    describe('Rounded Input', () => {
      it('should apply rounded class and 50% radius when rounded is true', () => {
        fixture.componentRef.setInput('rounded', true);
        fixture.detectChanges();

        expect(skeletonEl.classList.contains('ngcc--skeleton--rounded')).toBe(true);
        expect(skeletonEl.style.getPropertyValue('--ngcc-radius')).toBe('50%');
      });

      it('should remove rounded class when rounded is false', () => {
        fixture.componentRef.setInput('rounded', false);
        fixture.detectChanges();

        expect(skeletonEl.classList.contains('ngcc--skeleton--rounded')).toBe(false);
      });
    });

    describe('Custom Radius Input', () => {
      it('should apply pixel, percentage, and rem-based radius values', () => {
        fixture.componentRef.setInput('radius', '8px');
        fixture.detectChanges();
        expect(skeletonEl.style.getPropertyValue('--ngcc-radius')).toBe('8px');

        fixture.componentRef.setInput('radius', '25%');
        fixture.detectChanges();
        expect(skeletonEl.style.getPropertyValue('--ngcc-radius')).toBe('25%');

        fixture.componentRef.setInput('radius', '0.5rem');
        fixture.detectChanges();
        expect(skeletonEl.style.getPropertyValue('--ngcc-radius')).toBe('0.5rem');
      });

      it('should auto-append px to numeric radius values', () => {
        fixture.componentRef.setInput('radius', '16');
        fixture.detectChanges();

        expect(skeletonEl.style.getPropertyValue('--ngcc-radius')).toBe('16px');
      });
    });

    describe('Radius Priority & Negative Cases', () => {
      it('should prioritize radius over rounded value but keep rounded class', () => {
        fixture.componentRef.setInput('rounded', true);
        fixture.componentRef.setInput('radius', '12px');
        fixture.detectChanges();

        expect(skeletonEl.classList.contains('ngcc--skeleton--rounded')).toBe(true);
        expect(skeletonEl.style.getPropertyValue('--ngcc-radius')).toBe('12px');
      });

      it('should treat null, empty, or whitespace-only radius as unset', () => {
        fixture.componentRef.setInput('radius', null);
        fixture.detectChanges();
        expect(skeletonEl.style.getPropertyValue('--ngcc-radius')).toBe('');

        fixture.componentRef.setInput('radius', '');
        fixture.detectChanges();
        expect(skeletonEl.style.getPropertyValue('--ngcc-radius')).toBe('');

        fixture.componentRef.setInput('radius', '   ');
        fixture.detectChanges();
        expect(skeletonEl.style.getPropertyValue('--ngcc-radius')).toBe('');
      });

      it('should pass through invalid radius values (CSS variables are not validated)', () => {
        fixture.componentRef.setInput('radius', 'invalid-radius');
        fixture.detectChanges();

        expect(skeletonEl.style.getPropertyValue('--ngcc-radius')).toBe('invalid-radius');
      });
    });
  });

  // ───────────────────────────────────────────────────────────────
  // Dynamic Updates (Signal Reactivity)
  // ───────────────────────────────────────────────────────────────
  describe('Dynamic Updates (Signal Reactivity)', () => {
    it('should update width, height, and radius reactively', () => {
      expect(skeletonEl.style.width).toBe('100%');
      expect(skeletonEl.style.height).toBe('1rem');

      fixture.componentRef.setInput('width', '200px');
      fixture.componentRef.setInput('height', '60px');
      fixture.componentRef.setInput('radius', '4px');
      fixture.detectChanges();

      expect(skeletonEl.style.width).toBe('200px');
      expect(skeletonEl.style.height).toBe('60px');
      expect(skeletonEl.style.getPropertyValue('--ngcc-radius')).toBe('4px');

      fixture.componentRef.setInput('width', null);
      fixture.componentRef.setInput('height', null);
      fixture.componentRef.setInput('radius', null);
      fixture.detectChanges();

      expect(skeletonEl.style.width).toBe('100%');
      expect(skeletonEl.style.height).toBe('1rem');
      expect(skeletonEl.style.getPropertyValue('--ngcc-radius')).toBe('');
    });

    it('should toggle rounded class reactively', () => {
      expect(skeletonEl.classList.contains('ngcc--skeleton--rounded')).toBe(false);

      fixture.componentRef.setInput('rounded', true);
      fixture.detectChanges();
      expect(skeletonEl.classList.contains('ngcc--skeleton--rounded')).toBe(true);

      fixture.componentRef.setInput('rounded', false);
      fixture.detectChanges();
      expect(skeletonEl.classList.contains('ngcc--skeleton--rounded')).toBe(false);
    });
  });

  // ───────────────────────────────────────────────────────────────
  // WCAG Accessibility (Positive + Negative)
  // ───────────────────────────────────────────────────────────────
  describe('WCAG Accessibility', () => {
    const runAxe = async () => axe(hostEl);

    it('should have no accessibility violations by default', async () => {
      const results = await runAxe();
      expect(results).toHaveNoViolations();
    });

    it('should have no accessibility violations with custom dimensions', async () => {
      fixture.componentRef.setInput('width', '200px');
      fixture.componentRef.setInput('height', '50px');
      fixture.detectChanges();

      const results = await runAxe();
      expect(results).toHaveNoViolations();
    });

    it('should have no accessibility violations when rounded', async () => {
      fixture.componentRef.setInput('rounded', true);
      fixture.componentRef.setInput('width', '48px');
      fixture.componentRef.setInput('height', '48px');
      fixture.detectChanges();

      const results = await runAxe();
      expect(results).toHaveNoViolations();
    });

    it('should have required ARIA attributes on host', () => {
      expect(hostEl.getAttribute('role')).toBe('status');
      expect(hostEl.getAttribute('aria-busy')).toBe('true');
      expect(hostEl.getAttribute('aria-label')).toBe('Loading content');
    });

    it('should fail WCAG if invalid ARIA role is used (negative test)', async () => {
      hostEl.setAttribute('role', 'invalidrole');
      const results = await axe(hostEl);
      expect(results.violations.length).toBeGreaterThan(0);
    });
  });

  // ───────────────────────────────────────────────────────────────
  // CSS Custom Properties
  // ───────────────────────────────────────────────────────────────
  describe('CSS Custom Properties', () => {
    it('should set --ngcc-radius when radius is provided', () => {
      fixture.componentRef.setInput('radius', '10px');
      fixture.detectChanges();

      expect(skeletonEl.style.getPropertyValue('--ngcc-radius')).toBe('10px');
    });

    it('should set --ngcc-radius to 50% when rounded is true', () => {
      fixture.componentRef.setInput('rounded', true);
      fixture.detectChanges();

      expect(skeletonEl.style.getPropertyValue('--ngcc-radius')).toBe('50%');
    });
  });

  // ───────────────────────────────────────────────────────────────
  // Edge Cases
  // ───────────────────────────────────────────────────────────────
  describe('Edge Cases', () => {
    it('should handle zero values correctly', () => {
      fixture.componentRef.setInput('width', '0');
      fixture.componentRef.setInput('height', '0');
      fixture.componentRef.setInput('radius', '0');
      fixture.detectChanges();

      expect(skeletonEl.style.width).toBe('0px');
      expect(skeletonEl.style.height).toBe('0px');
      expect(skeletonEl.style.getPropertyValue('--ngcc-radius')).toBe('0px');
    });

    it('should handle calc() expressions', () => {
      fixture.componentRef.setInput('width', 'calc(100% - 20px)');
      fixture.componentRef.setInput('height', 'calc(2rem + 10px)');
      fixture.detectChanges();

      expect(skeletonEl.style.width).toBe('calc(100% - 20px)');
      expect(skeletonEl.style.height).toMatch(/^calc\(.+\)$/);
    });

    it('should preserve CSS keyword values', () => {
      fixture.componentRef.setInput('width', 'auto');
      fixture.componentRef.setInput('height', 'fit-content');
      fixture.detectChanges();

      expect(skeletonEl.style.width).toBe('auto');
      expect(skeletonEl.style.height).toBe('fit-content');
    });
  });
});
