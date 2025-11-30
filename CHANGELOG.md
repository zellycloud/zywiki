# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.5] - 2025-11-30

### Fixed
- **Import Error**: Fixed critical import error in `git-hooks.mjs` where `getConfig` function was not available in `metadata.mjs`
- **Function Reference**: Replaced `getConfig()` with `loadConfig()` to match the actual exported function
- **Git Tracking**: Added `.zyflow/` to `.gitignore` to prevent tracking of system-generated files

### Changed
- **Git Ignore**: Updated `.gitignore` to exclude `.zyflow/` directory and its contents
- **File Management**: Removed `.zyflow/tasks.db` from Git tracking

## [0.2.4] - Previous

### Features
- AI-powered code wiki generation
- Git hooks integration for automatic documentation sync
- Support for multiple programming languages and frameworks
- Claude Code integration
- Command-line interface with comprehensive commands

---

## [Unreleased]

### Planned
- Enhanced AI model support
- Improved template system
- Better integration with development workflows