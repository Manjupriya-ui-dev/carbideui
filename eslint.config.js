// @ts-check
const tsEslint = require('@typescript-eslint/eslint-plugin');
const tsParser = require('@typescript-eslint/parser');
const angularEslint = require('@angular-eslint/eslint-plugin');
const angularTemplateEslint = require('@angular-eslint/eslint-plugin-template');
const angularTemplateParser = require('@angular-eslint/template-parser');
const eslintConfigPrettier = require('eslint-config-prettier');

/** @type {import('eslint').Linter.Config[]} */
module.exports = [
  // ==========================================================================
  // Global ignores
  // ==========================================================================
  {
    ignores: [
      'dist/',
      'node_modules/',
      'coverage/',
      '.angular/',
      'storybook-static/',
      '**/*.spec.ts',
      '**/*.stories.ts',
    ],
  },

  // ==========================================================================
  // TypeScript files — component library source
  // ==========================================================================
  {
    files: ['projects/carbideui/src/**/*.ts'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: './projects/carbideui/tsconfig.lib.json',
      },
    },
    plugins: {
      '@typescript-eslint': tsEslint,
      '@angular-eslint': angularEslint,
    },
    rules: {
      // ── TypeScript strict rules ──────────────────────────────────────
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/explicit-function-return-type': [
        'warn',
        { allowExpressions: true, allowTypedFunctionExpressions: true },
      ],
      '@typescript-eslint/no-inferrable-types': 'off',
      '@typescript-eslint/no-non-null-assertion': 'warn',
      '@typescript-eslint/consistent-type-definitions': ['error', 'interface'],
      '@typescript-eslint/naming-convention': [
        'warn',
        {
          selector: 'interface',
          format: ['PascalCase'],
          prefix: ['Ngcc'],
        },
      ],

      // ── Angular component library rules ──────────────────────────────
      '@angular-eslint/directive-class-suffix': 'error',
      '@angular-eslint/component-selector': [
        'error',
        { type: 'element', prefix: 'ngcc', style: 'kebab-case' },
      ],
      '@angular-eslint/directive-selector': [
        'error',
        { type: 'attribute', prefix: 'ngcc', style: 'camelCase' },
      ],
      '@angular-eslint/no-input-rename': 'error',
      '@angular-eslint/no-output-rename': 'error',
      '@angular-eslint/no-output-on-prefix': 'error',
      '@angular-eslint/use-lifecycle-interface': 'error',
      '@angular-eslint/prefer-on-push-component-change-detection': 'error',
      '@angular-eslint/use-pipe-transform-interface': 'error',
      '@angular-eslint/no-empty-lifecycle-method': 'error',
      '@angular-eslint/contextual-lifecycle': 'error',
      '@angular-eslint/no-conflicting-lifecycle': 'error',
      '@angular-eslint/prefer-standalone': 'warn',
      '@angular-eslint/relative-url-prefix': 'error',

      // ── General best practices ───────────────────────────────────────
      'no-console': ['error', { allow: ['warn', 'error'] }],
      'no-debugger': 'error',
      'no-duplicate-imports': 'error',
      'no-shadow': 'off',
      '@typescript-eslint/no-shadow': 'error',
      eqeqeq: ['error', 'always'],
      'prefer-const': 'error',
      'no-var': 'error',
      'object-shorthand': ['error', 'always'],
      'no-throw-literal': 'error',
    },
  },

  // ==========================================================================
  // Angular HTML templates — accessibility & template safety
  // ==========================================================================
  {
    files: ['projects/carbideui/src/**/*.html'],
    languageOptions: {
      parser: angularTemplateParser,
    },
    plugins: {
      '@angular-eslint/template': angularTemplateEslint,
    },
    rules: {
      // ── Accessibility rules (WCAG 2.1 AA) ───────────────────────────
      '@angular-eslint/template/alt-text': 'error',
      '@angular-eslint/template/elements-content': 'error',
      '@angular-eslint/template/label-has-associated-control': 'warn',
      '@angular-eslint/template/valid-aria': 'error',
      '@angular-eslint/template/role-has-required-aria': 'error',
      '@angular-eslint/template/no-positive-tabindex': 'error',
      '@angular-eslint/template/click-events-have-key-events': 'warn',
      '@angular-eslint/template/mouse-events-have-key-events': 'warn',
      '@angular-eslint/template/interactive-supports-focus': 'warn',
      '@angular-eslint/template/no-autofocus': 'warn',
      '@angular-eslint/template/table-scope': 'error',

      // ── Template best practices ──────────────────────────────────────
      '@angular-eslint/template/no-negated-async': 'error',
      '@angular-eslint/template/no-duplicate-attributes': 'error',
      '@angular-eslint/template/use-track-by-function': 'warn',
      '@angular-eslint/template/banana-in-box': 'error',
      // Disabled — Angular signals require function calls (signal()) in templates
      '@angular-eslint/template/no-call-expression': 'off',
      '@angular-eslint/template/prefer-self-closing-tags': 'warn',
      '@angular-eslint/template/conditional-complexity': ['warn', { maxComplexity: 3 }],
      '@angular-eslint/template/no-interpolation-in-attributes': 'error',
    },
  },

  // ==========================================================================
  // Prettier compat — must be last to disable conflicting format rules
  // ==========================================================================
  eslintConfigPrettier,
];
