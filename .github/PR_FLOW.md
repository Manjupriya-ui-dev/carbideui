# Pull Request Flow

This document describes the end-to-end lifecycle of a pull request in this repository — from writing code to a published npm release.

---

## Overview

```
 Local Development
 ─────────────────
  1. Branch from main
  2. Write code (signals, OnPush, WCAG 2.1 AA)
  3. Commit (conventional format)
  4. npm run precheck  →  lint + test + build
        │
        ▼
 Open Pull Request
 ─────────────────
  5. PR title follows conventional commit format
  6. Fill PR template (description, changelog, checklist)
  7. Auto-labels applied by labeler bot
        │
        ▼
 Automated CI Checks (parallel)         Governance Checks
 ──────────────────────────────         ─────────────────
  8a. Lint  (ESLint + Prettier)          8b. PR title lint (commitlint)
  8c. Test  (Vitest + coverage)          8d. DCO signing check
  8e. Build (ng-packagr + audit)         8f. CodeQL security scan
        │
        ▼
 Code Review
 ───────────
  9. Maintainer review (@assistanz/carbideui-maintainers)
 10. All checklist items verified
 11. All CI checks green
        │
        ▼
 Merge to main (squash merge)
 ──────────────────────────────
 12. CI runs again on main push
        │
        ├─► Semantic Release  →  npm publish + GitHub Release
        └─► Storybook Deploy  →  GitHub Pages updated
```

---

## 1. Local Development

### 1.1 Create a Branch

Branch from `main` using the conventional naming format:

```
<type>/<short-description>
```

| Type | Use when |
|------|----------|
| `feat/` | Adding a new component or capability |
| `fix/` | Fixing a bug |
| `docs/` | Documentation-only changes |
| `refactor/` | Code restructuring with no behaviour change |
| `test/` | Adding or updating tests |
| `chore/` | Tooling, dependencies, CI config |

```bash
git checkout main && git pull origin main
git checkout -b feat/ngcc-tooltip-arrow
```

### 1.2 Write Code

Follow the [coding standards](CONTRIBUTING.md#coding-standards):

- **Standalone components only** — no NgModule
- **Signals** — `input()`, `output()`, `signal()`, `computed()`
- **`ChangeDetectionStrategy.OnPush`** — required on every component
- **`ngcc-` selector prefix** — e.g. `lib-ngcc-button`
- **No `any`** — strict TypeScript throughout
- **WCAG 2.1 AA** — include `vitest-axe` accessibility assertions in spec files
- **Storybook story** — every component needs a `.stories.ts` file

Component folder structure:

```
projects/carbideui/src/lib/ngcc-<name>/
├── ngcc-<name>.component.ts
├── ngcc-<name>.component.html
├── ngcc-<name>.component.scss
├── ngcc-<name>.component.spec.ts   ← unit + a11y tests
├── ngcc-<name>.stories.ts
└── index.ts
```

### 1.3 Commit with Conventional Format

The `commit-msg` Husky hook enforces [Conventional Commits](https://www.conventionalcommits.org/) via commitlint. Use the interactive wizard to avoid errors:

```bash
npm run commit
```

Or write manually:

```
<type>(<scope>): <subject>
```

**Allowed types:** `feat` `fix` `docs` `style` `refactor` `perf` `test` `build` `ci` `chore` `revert`

**Allowed scopes** (optional): `button` `checkbox` `datepicker` `dropdown` `input` `textarea` `tabs` `accordion` `table` `pagination` `toast` `notification` `modal` `tooltip` `skeleton` `charts` `icons` `i18n` `theme`

**Subject rules:** max 100 chars · no PascalCase/UPPER_CASE/Title Case · no trailing period

**Breaking changes:**

```
feat(button)!: rename size prop to buttonSize

BREAKING CHANGE: The `size` input has been renamed to `buttonSize`.
```

### 1.4 Run the Pre-flight Check

The `pre-commit` Husky hook runs lint automatically, but run the full check before pushing:

```bash
npm run precheck   # build:lib + test + lint + audit
```

This mirrors what CI will do, catching failures before they block your PR.

---

## 2. Opening the Pull Request

### 2.1 PR Title

The PR title **must** follow the conventional commit format — it is validated by the `commitlint.yaml` workflow on every edit:

```
feat(tooltip): add arrow position control
fix(table): resolve sorting regression on empty data
docs: update installation guide for Angular 21
```

The title becomes the squash-merge commit message and determines the semantic version bump.

### 2.2 Fill the PR Template

GitHub pre-fills the description with `.github/PULL_REQUEST_TEMPLATE.md`. Complete every section:

| Section | What to include |
|---------|----------------|
| **Related Issue** | `Closes #<number>` to auto-close the issue on merge |
| **Description** | What changed and why |
| **Changelog** | New / Changed / Removed entries |
| **Type of Change** | Check all applicable boxes |
| **Testing / Reviewing** | Steps for a reviewer to verify the change |
| **Checklist** | All items must be checked before requesting review |
| **DCO** | Declaration that your contribution is original work |
| **Screenshots** | Required for any UI changes |

### 2.3 Auto-Labels

The `labeler.yaml` workflow automatically applies labels based on changed file paths:

| Label | Triggered by |
|-------|-------------|
| `area: components` | `lib/**/*.ts`, `lib/**/*.html` |
| `area: styles` | `**/*.scss`, `styles/**` |
| `area: docs` | `**/*.md`, `**/*.mdx`, story files |
| `area: tests` | `**/*.spec.ts`, `vitest.config.*` |
| `area: ci` | `.github/**` |
| `area: storybook` | `.storybook/**`, story files |
| `area: i18n` | `ngcc-i18n/**` |
| `area: build` | `package.json`, `angular.json`, `tsconfig.*` |

---

## 3. Automated CI Checks

CI (`ci.yaml`) triggers on every PR push to `main`. Jobs run in parallel with a 10–15 minute timeout each.

### 3.1 Lint (parallel, 10 min)

```
ESLint  →  strict TypeScript rules, Angular rules, ngcc-prefix, no-any
Prettier →  printWidth:100, singleQuote, trailing commas, LF line endings
```

Fix locally: `npm run lint:fix`

### 3.2 Test (parallel, 15 min)

```
Vitest + @vitest/coverage-v8
  └─ unit tests (.spec.ts files)
  └─ accessibility tests (vitest-axe, WCAG 2.1 AA)
  └─ coverage report uploaded to Codecov
```

Run locally: `npm run test` · `npm run test:coverage`

### 3.3 Build (after lint + test pass, 10 min)

```
ng-packagr (production build)
  └─ npm run audit:prod    (no high/critical production vulnerabilities)
  └─ npm run audit:licenses (license compliance)
```

Run locally: `npm run build:lib`

### 3.4 Governance Checks (parallel, independent)

| Workflow | What it checks |
|----------|---------------|
| `commitlint.yaml` | PR title follows conventional commit format |
| `dco.yaml` | All commits signed with Developer Certificate of Origin |
| `codeql-analysis.yaml` | Static security analysis (javascript-typescript) |

**DCO signing:** Every commit must include a `Signed-off-by` line. Use `git commit -s` or retroactively sign with `git rebase --signoff HEAD~<n> && git push --force-with-lease`.

### 3.5 Concurrency

CI uses concurrency groups (`${{ github.workflow }}-${{ github.ref }}`). If you push a new commit while CI is running, the previous run is cancelled and a fresh run starts. This keeps CI fast during iterative development.

---

## 4. Code Review

### 4.1 Reviewers

Reviews are assigned automatically based on `.github/CODEOWNERS`:

- **All files** → `@assistanz/carbideui-maintainers`
- **`.github/` workflows** → admin-level review required

Request review from the maintainers team once all CI checks are green.

### 4.2 Review Checklist (for Reviewers)

- [ ] PR title is in conventional commit format
- [ ] All CI checks pass (lint, test, build, DCO, CodeQL)
- [ ] Component uses signals, OnPush, and standalone pattern
- [ ] Accessibility assertions present (`vitest-axe`)
- [ ] Storybook story added or updated
- [ ] No `any` types, no `console.log`
- [ ] Breaking changes documented in BREAKING CHANGE footer
- [ ] PR checklist fully completed by author

### 4.3 Addressing Review Comments

Push new commits to the branch — CI reruns automatically. Mark review comments as resolved after addressing them. Do not force-push after review has started unless requested by a maintainer.

---

## 5. Merge

### 5.1 Prerequisites

Before a PR can be merged, **all** of the following must be true:

- [ ] `Lint` CI job passed
- [ ] `Test` CI job passed
- [ ] `Build` CI job passed
- [ ] `PR title lint` passed
- [ ] `DCO` check passed
- [ ] At least one approved review from `@assistanz/carbideui-maintainers`
- [ ] No unresolved review comments

### 5.2 Merge Strategy

All PRs are **squash merged** into `main`. The squash commit message is taken from the PR title (which must be in conventional commit format). This keeps `main` history clean and ensures every commit is parseable by Semantic Release.

---

## 6. Post-Merge Automation

Three pipelines trigger automatically on every push to `main`.

### 6.1 Semantic Release (publish.yaml)

```
Commit analyzer reads all commits since last release
        │
        ├─ fix:      → patch bump  (1.2.3 → 1.2.4)
        ├─ feat:     → minor bump  (1.2.3 → 1.3.0)
        └─ BREAKING  → major bump  (1.2.3 → 2.0.0)
        │
        ▼
npm --prefix projects/ngcc version <new-version>
npm run build:lib          (ng-packagr production build)
npm publish dist/ngcc      (published to npmjs.com as @assistanz/carbideui)
git tag v<new-version>
GitHub Release created with auto-generated release notes
"status: released" label applied to closed issues
```

**Secrets required:** `NPM_TOKEN`, `GITHUB_TOKEN` (auto-provided)

### 6.2 Storybook Deploy (deploy-github-pages.yaml)

```
npm run build-storybook    (static build of component docs)
        │
        ▼
Uploaded to GitHub Pages artifact
Deployed to GitHub Pages environment
```

The live Storybook is updated automatically — no manual step needed.

### 6.3 CI on main

The standard `ci.yaml` pipeline also runs on the main push (same lint/test/build jobs as on the PR), confirming the squash-merged state is healthy.

---

## 7. Version Bump Reference

| Commit type | Example | Version impact |
|-------------|---------|----------------|
| `fix:` | `fix(input): correct placeholder color` | Patch `x.x.+1` |
| `perf:` | `perf(table): reduce render cycles` | Patch `x.x.+1` |
| `feat:` | `feat(tooltip): add arrow position` | Minor `x.+1.0` |
| `feat!:` or `BREAKING CHANGE` | `feat(button)!: rename size prop` | Major `+1.0.0` |
| `docs:` `chore:` `ci:` `style:` `test:` `refactor:` | — | No release |

---

## 8. Quick Reference

```bash
# Start work
git checkout main && git pull origin main
git checkout -b feat/my-feature

# Develop
npm start                   # dev server
npm run storybook           # component explorer

# Before pushing
npm run commit              # interactive conventional commit
npm run precheck            # full validation

# Fix CI failures locally
npm run lint:fix            # auto-fix lint
npm run test                # run tests
npm run build:lib           # verify build

# After merge (automatic)
# → npm publish @assistanz/carbideui (if release-worthy commits)
# → GitHub Release created
# → Storybook updated on GitHub Pages
```

---

## 9. Dependabot PRs

Dependabot opens dependency update PRs weekly, grouped by ecosystem:

| Group | Packages |
|-------|----------|
| Angular | `@angular/*` |
| Carbon | `@carbon/*` |
| Storybook | `@storybook/*`, `storybook` |
| Dev dependencies | All other dev deps |

These PRs follow the same CI + review flow. A maintainer reviews and merges them. Dependabot is limited to 10 open PRs at a time.
