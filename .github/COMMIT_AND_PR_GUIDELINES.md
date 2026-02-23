# Commit & PR Guidelines

Practical reference for every contributor. These rules are machine-enforced — Husky hooks gate commits locally, and CI gates merges on GitHub.

---

## Table of Contents

- [Commit Messages](#commit-messages)
  - [Format](#format)
  - [Types](#types)
  - [Scopes](#scopes)
  - [Rules & Examples](#rules--examples)
  - [Breaking Changes](#breaking-changes)
  - [Version Impact](#version-impact)
- [Pull Requests](#pull-requests)
  - [Branch Naming](#branch-naming)
  - [PR Title](#pr-title)
  - [PR Description](#pr-description)
  - [Checklist](#checklist)
  - [Labels](#labels)
  - [Review Requirements](#review-requirements)
- [DCO Signing](#dco-signing)
- [Quick Reference](#quick-reference)

---

## Commit Messages

### Format

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

| Part | Required | Constraint |
|------|----------|-----------|
| `type` | Yes | Lowercase, from the allowed list |
| `scope` | No | Lowercase, component name or custom |
| `description` | Yes | Imperative tense · max 100 chars · no period at end |
| `body` | No | Free text, wrap at 100 chars |
| `footer` | No | `BREAKING CHANGE:` or `Closes #<n>` |

> **Fastest way to commit:** `npm run commit` — the interactive wizard builds the message for you.

---

### Types

| Type | Purpose | Triggers a release? |
|------|---------|:-------------------:|
| `feat` | New component or capability | Yes — minor |
| `fix` | Bug fix | Yes — patch |
| `perf` | Performance improvement | Yes — patch |
| `revert` | Revert a previous commit | Yes — patch |
| `docs` | Documentation only | No |
| `style` | Formatting, whitespace (no logic change) | No |
| `refactor` | Code restructuring (no feat or fix) | No |
| `test` | Adding or updating tests | No |
| `build` | Build system or dependency updates | No |
| `ci` | CI/CD workflow changes | No |
| `chore` | Maintenance (gitignore, scripts, config) | No |

---

### Scopes

Use the component name as the scope. These are the recognised scopes:

```
button · checkbox · datepicker · dropdown · input · textarea
tabs · accordion · table · pagination · toast · notification
modal · tooltip · skeleton · charts · icons · i18n · theme
```

Custom scopes are allowed for cross-cutting concerns (e.g. `core`, `a11y`, `build`).

---

### Rules & Examples

#### Type must be lowercase

```bash
# Good
feat(button): add loading state

# Bad — rejected by commitlint
Feat(button): add loading state
FEAT: add loading state
```

#### Description: imperative tense, no period, no capitalisation

```bash
# Good
fix(modal): prevent focus escaping trap
feat(table): add column pinning

# Bad
fix(modal): Prevents focus from escaping.   # capitalised + period
feat(table): added column pinning            # past tense
```

#### Scope: lowercase only

```bash
# Good
feat(dropdown): add multi-select support

# Bad
feat(Dropdown): add multi-select support
feat(DROPDOWN): add multi-select support
```

#### Body: use when the description alone is insufficient

```bash
fix(table): resolve sort regression on empty data

Sorting triggered a comparison on undefined rows when the data array
was empty on initial render. Guard added before the sort comparator.

Closes #214
```

---

### Breaking Changes

Mark breaking changes with `!` after the type/scope, and always add a `BREAKING CHANGE:` footer explaining the migration path.

```bash
feat(dropdown)!: replace EventEmitter API with signals

BREAKING CHANGE: `selectedChange` EventEmitter has been removed.
Use the `selected` signal input instead.

Before: (selectedChange)="onSelect($event)"
After:  [selected]="mySignal"
```

A breaking change triggers a **major** version bump.

---

### Version Impact

Semantic Release reads every commit since the last release to determine the next version:

```
fix / perf / revert   →   patch   1.2.3  →  1.2.4
feat                  →   minor   1.2.3  →  1.3.0
feat! / BREAKING      →   major   1.2.3  →  2.0.0
docs / style /
refactor / test /
build / ci / chore    →   no release
```

---

## Pull Requests

### Branch Naming

```
<type>/<short-description>
```

| Prefix | Use for |
|--------|---------|
| `feat/` | New components or features |
| `fix/` | Bug fixes |
| `docs/` | Documentation updates |
| `refactor/` | Code restructuring |
| `test/` | Test additions or updates |
| `chore/` | Maintenance, dependency updates |

```bash
feat/ngcc-radio-button
fix/dropdown-escape-key
docs/storybook-tooltip-examples
chore/update-angular-21
```

---

### PR Title

The PR title **is** the squash-merge commit message. It is validated by CI on every push and edit — use the same rules as a commit header.

```
<type>(<scope>): <description>
```

```bash
# Good
feat(tooltip): add arrow position control
fix(table): resolve sorting regression on empty data
docs: update installation guide for Angular 21
chore: upgrade @carbon/styles to v1.100.0

# Bad — CI will reject
Add tooltip arrow              # no type
Feat: new tooltip              # capitalised type
fix(Modal): Escape key fix.    # capitalised scope + period
```

---

### PR Description

Open a PR against `main`. GitHub pre-fills the template — complete every section:

#### Related Issue
```
Closes #<issue-number>
```
Writing `Closes #` auto-closes the issue when the PR is merged.

#### Description
One or two sentences on _what_ changed and _why_. Focus on the intent, not the implementation.

#### Changelog

List only the externally observable changes:

```markdown
**New**
- `NgccTooltip`: `arrowPosition` input accepts `top | bottom | left | right`

**Changed**
- `NgccDropdown`: `selectedChange` emits on keyboard selection as well as click

**Removed**
- `NgccModal`: deprecated `backdropClick` output removed (use `overlayClick`)
```

#### Type of Change
Check all that apply:
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Performance improvement
- [ ] Documentation update
- [ ] Refactoring
- [ ] CI/CD or build configuration

#### Testing / Reviewing
Tell reviewers how to verify the change. Include Storybook story name, test command, or manual steps.

#### Screenshots
Required for any visible UI change. Add before/after screenshots or a screen recording.

---

### Checklist

Complete this before requesting review. Unchecked items will be flagged during review.

**Code quality**
- [ ] Reviewed every line of my own diff
- [ ] No `any` types — strict TypeScript throughout
- [ ] No `console.log` — only `console.warn` / `console.error`
- [ ] `ChangeDetectionStrategy.OnPush` on every component
- [ ] Signals used: `input()`, `output()`, `signal()`, `computed()`
- [ ] Standalone component (no NgModule)

**Automated gates**
- [ ] `npm run lint` passes (ESLint + Prettier)
- [ ] `npm run test` passes — all tests green
- [ ] `npm run build:lib` succeeds
- [ ] `npm run precheck` passes end-to-end

**Accessibility**
- [ ] `vitest-axe` assertions added or updated in `.spec.ts`
- [ ] Keyboard navigation verified
- [ ] ARIA attributes valid and meaningful
- [ ] Color contrast meets WCAG 2.1 AA (4.5:1 text, 3:1 UI)

**Completeness**
- [ ] Storybook story added or updated
- [ ] Public API exported from `index.ts`
- [ ] Cross-browser tested for UI changes (Chrome · Firefox · Safari · Edge)
- [ ] Documentation updated if behaviour changed
- [ ] DCO signed (see [DCO Signing](#dco-signing))

---

### Labels

Labels are applied automatically by the `labeler` bot based on which files changed. No manual action needed.

| Label | Files that trigger it |
|-------|-----------------------|
| `area: components` | `lib/**/*.ts`, `lib/**/*.html` |
| `area: styles` | `**/*.scss`, `styles/**` |
| `area: docs` | `**/*.md`, `**/*.mdx`, `*.stories.ts` |
| `area: tests` | `**/*.spec.ts`, `vitest.config.*` |
| `area: ci` | `.github/**` |
| `area: storybook` | `.storybook/**`, `*.stories.ts` |
| `area: i18n` | `ngcc-i18n/**` |
| `area: build` | `package.json`, `angular.json`, `tsconfig.*` |

After merge, Semantic Release adds `status: released` to any linked issues.

---

### Review Requirements

| Gate | Requirement |
|------|-------------|
| CI — Lint | ESLint + Prettier must pass |
| CI — Test | All Vitest tests + coverage must pass |
| CI — Build | `ng-packagr` production build + dependency audit must pass |
| PR Title Lint | Conventional commit format validated by `action-semantic-pull-request` |
| DCO | All commits must be signed |
| CodeQL | Security scan must pass |
| Human review | At least **one approval** from `@assistanz/carbideui-maintainers` |
| Comments | All review threads resolved |

Once all gates are green, a maintainer squash-merges the PR into `main`.

> `.github/` workflow changes require an additional **admin-level** review per CODEOWNERS.

---

## DCO Signing

All contributions require a [Developer Certificate of Origin](https://developercertificate.org/) sign-off certifying you have the right to submit the work.

### Sign each commit (required)

```bash
git commit -s -m "feat(button): add icon-only variant"
# Appends: Signed-off-by: Your Name <email@example.com>
```

To retroactively sign all commits on a branch:

```bash
git rebase --signoff HEAD~<number-of-commits>
git push --force-with-lease
```

> **Important:** Every commit must include a `Signed-off-by` line. The DCO check is strictly commit-based — PR comments are not accepted as an alternative.

---

## Quick Reference

```bash
# --- Commit ---
git add <files>
npm run commit                 # interactive wizard (recommended)
# or manually:
git commit -s -m "feat(tooltip): add arrow position control"

# --- Local validation (mirrors CI) ---
npm run lint                   # ESLint + Prettier
npm run lint:fix               # auto-fix lint issues
npm run test                   # run all tests
npm run test:coverage          # with coverage report
npm run build:lib              # production build
npm run precheck               # all of the above

# --- Storybook ---
npm run storybook              # dev server at localhost:6006
npm run build-storybook        # static build

# --- Branch ---
git checkout main && git pull origin main
git checkout -b feat/my-feature
git push origin feat/my-feature
# then open PR on GitHub against main
```

### Commit type cheat sheet

```
feat      →  new feature           minor release
fix       →  bug fix               patch release
perf      →  performance           patch release
docs      →  documentation         no release
style     →  formatting only       no release
refactor  →  restructure code      no release
test      →  add/update tests      no release
build     →  deps / build system   no release
ci        →  CI/CD config          no release
chore     →  maintenance           no release
revert    →  undo commit           patch release
feat!     →  breaking change       major release
```
