# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.3.0] - 2025-12-04

### Added
- **RAG Search**: Local semantic search using Orama + Transformers.js
  - `zywiki search <query>`: Search wiki documents using hybrid search (BM25 + vector)
  - Auto-index after `build` and `update` commands
  - Multilingual support with multilingual-e5-small embedding model
  - Optional dependencies (RAG packages only installed when needed)

### Changed
- **Build/Update Semantics**: Redesigned command behavior to follow conventional patterns
  - `build`: Full documentation generation (prompts for confirmation if docs exist)
  - `build --force`: Skip confirmation and rebuild all
  - `update`: Only update pending documents (changed source files)
- **CLI Commands**: Simplified from 11 to 6 commands
  - Removed: `add`, `detect`, `sync`, `index`, `group`
  - Kept: `init`, `build`, `update`, `status`, `search`, `stack`

### Improved
- **Status Display**: Show build progress with tracked files, groups, and provider info
- **Error Messages**: Better guidance when RAG dependencies are not installed

## [0.2.8] - 2025-12-03

### Fixed
- **Pending Clear on Build**: `zywiki build` now clears pending.json after successful generation
- **Status Output**: Limited file/doc list to 5 items with summary count to prevent excessive output

## [0.2.6] - 2025-12-03

### Added
- **Auto-detect Git**: Automatically prompts to enable Git hooks when `.git` directory is detected
- **Auto-detect Claude Code**: Automatically prompts to enable Claude Code integration when `.claude` directory or `claude` CLI is detected

### Changed
- **Interactive Setup**: `zywiki init` now asks whether to enable Git hooks and Claude Code integration instead of requiring CLI flags
- **Default Behavior**: Git and Claude integrations are now prompted with `Y` as default when detected

### Fixed
- **Preserve Metadata on --force**: `zywiki init --force` now preserves existing metadata.json instead of resetting it, preventing unnecessary full rebuilds

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