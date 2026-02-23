import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NgccThemeSwitcher } from './ngcc-theme-switcher';
import { provideZonelessChangeDetection } from '@angular/core';
import { NgccThemeService } from './ngcc-theme.service';
import { BaseThemeNamesType } from './ngcc-theme.types';

describe('NgccThemeSwitcher', () => {
  let fixture: ComponentFixture<NgccThemeSwitcher>;
  let component: NgccThemeSwitcher;

  let themeService: {
    getTheme: ReturnType<typeof vi.fn>;
    setTheme: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    themeService = {
      getTheme: vi.fn().mockReturnValue('white'),
      setTheme: vi.fn().mockImplementation((theme) => {
        document.documentElement.setAttribute('data-carbon-theme', theme);
      }),
    };

    await TestBed.configureTestingModule({
      imports: [NgccThemeSwitcher],
      providers: [
        provideZonelessChangeDetection(),
        { provide: NgccThemeService, useValue: themeService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(NgccThemeSwitcher);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should render all available themes', () => {
    const buttons = fixture.debugElement.queryAll(By.css('button'));
    expect(buttons.length).toBe(component['themes'].length);
    expect(buttons[0].nativeElement.textContent.trim()).toBe('white');
  });

  it('should display the current active theme', () => {
    const heading = fixture.debugElement.query(By.css('h4')).nativeElement;
    const targetTheme = 'white' as BaseThemeNamesType;
    component['setTheme'](targetTheme);
    fixture.detectChanges();

    expect(heading.textContent).toContain('white');
  });

  it('should call setTheme on button click and update currentTheme signal', () => {
    const buttons = fixture.debugElement.queryAll(By.css('button'));
    const targetTheme = 'g90' as BaseThemeNamesType;

    buttons
      .find((btn) => btn.nativeElement.textContent.trim() === targetTheme)
      ?.nativeElement.click();
    fixture.detectChanges();

    expect(component['currentTheme']()).toBe(targetTheme);
  });

  it('should update DOM attribute data-carbon-theme when theme changes', () => {
    const targetTheme = 'g100' as BaseThemeNamesType;
    component['setTheme'](targetTheme);
    fixture.detectChanges();

    expect(document.documentElement.getAttribute('data-carbon-theme')).toBe(targetTheme);
  });

  it('should highlight the active button', () => {
    const targetTheme = 'curved' as BaseThemeNamesType;
    component['setTheme'](targetTheme);
    fixture.detectChanges();

    const activeButton = fixture.debugElement.query(By.css('button.active'));
    expect(activeButton.nativeElement.textContent.trim()).toBe(targetTheme);
  });
});
