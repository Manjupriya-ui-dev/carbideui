# Security Policy

<!-- ## Supported Versions

| Version | Supported          |
|---------|--------------------|
| 0.0.x   | :white_check_mark: | -->

## Reporting a Vulnerability

If you discover a security vulnerability in this project, please report it responsibly.

**Do NOT open a public GitHub issue for security vulnerabilities.**

Instead, please email **vanaraj@assistanz.com** with:

- A description of the vulnerability
- Steps to reproduce
- Affected versions
- Any potential impact

## Scope

This policy covers the `@assistanz/carbideui` npm package and its source code. Vulnerabilities in third-party dependencies (e.g., `@carbon/styles`, `@carbon/charts`) should be reported to their respective maintainers.

## Dependency Vulnerability Policy

This project may occasionally report vulnerabilities from development-only dependencies (e.g., build tools, linters, bundlers).

These do **not affect runtime or production builds** and therefore are not considered security issues for the published package.

We prioritize fixes for:

- Runtime dependencies
- Direct dependencies
- Production-impacting vulnerabilities

Issues affecting only devDependencies will generally be addressed when upstream maintainers release patches.

If you believe a vulnerability affects runtime behavior, please report it.

## Response Timeline

- **Acknowledgment:** Within 48 hours of report
- **Initial assessment:** Within 5 business days
- **Fix and disclosure:** Coordinated with the reporter

## Recognition

We appreciate responsible disclosure and will credit reporters in the release notes (unless anonymity is requested).
