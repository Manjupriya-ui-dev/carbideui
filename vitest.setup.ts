import 'zone.js';
import 'zone.js/testing';
import { getTestBed } from '@angular/core/testing';
import { destroyPlatform } from '@angular/core';
import * as matchers from 'vitest-axe/matchers';
import { expect } from 'vitest';
import 'vitest-axe/extend-expect';
import {
  BrowserTestingModule,
  platformBrowserTesting,
} from '@angular/platform-browser/testing';

// plugging axe into Vitest’s assertion engine
expect.extend(matchers);

declare module 'vitest' {
  export interface Assertion<T = any> extends VitestAxeMatchers { }
  export interface AsymmetricMatchersContaining extends VitestAxeMatchers { }
}

interface VitestAxeMatchers {
  toHaveNoViolations(): void;
}

// Initialize Angular's testing environment for browser-based unit tests
// Destroy any existing platform first to avoid conflicts in singleThread mode
try {
  destroyPlatform();
} catch {
  // Ignore error if no platform exists
}

getTestBed().initTestEnvironment(
  BrowserTestingModule,
  platformBrowserTesting()
);

// Mock ResizeObserver (jsdom does not implement it)
global.ResizeObserver = class ResizeObserver {
  observe() { }
  unobserve() { }
  disconnect() { }
};

// Mock SVG text measurement used by tooltips, charts, and layout logic
Object.defineProperty(window.SVGElement.prototype, 'getComputedTextLength', {
  value: () => 0,
  writable: true,
});
