import { defineConfig } from 'vitest/config';
import angular from '@analogjs/vite-plugin-angular';

export default defineConfig({
  plugins: [
    angular(),
  ],

  test: {
    // --- Core ---
    environment: 'jsdom',
    globals: true,
    watch: true,

    // --- Execution model (Optimized for Memory) ---
    pool: 'threads',
    poolOptions: {
      threads: {
        singleThread: true,
      },
    },
    maxConcurrency: 5, // Limit concurrent tests within a suite

    // --- Test discovery ---
    include: ['projects/**/src/**/*.spec.ts'],

    // --- Setup ---
    setupFiles: ['vitest.setup.ts'],

    // --- Timeouts ---
    testTimeout: 40_000,
    hookTimeout: 40_000,

    // --- Mock behavior ---
    restoreMocks: true,
    clearMocks: true,

    // --- Reporters ---
    reporters: ['default'],

    // --- Dependencies optimization (Angular needs this) ---
    deps: {
      optimizer: {
        web: {
          include: [
            '@angular/core',
            '@angular/common',
            '@angular/platform-browser',
          ],
        },
      },
    },

    // --- Coverage ---
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      reportsDirectory: './coverage',

      include: [
        'projects/**/src/lib/**/*.ts',
      ],

      exclude: [
        '**/*.spec.ts',
        '**/*.stories.ts',
        '**/public-api.ts',
        '**/*.types.ts',
        '**/*.model.ts',
        '**/*.interface.ts',
        '**/*-demo.ts',
        '**/*-mock.ts',
        'storybook-static/**',
        'node_modules/**',
      ],

      excludeAfterRemap: true,
    },
  },
});
