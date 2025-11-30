# zywiki CLI Specification

## ADDED Requirements

### Requirement: CLI Initialization
The `zywiki init` command SHALL initialize documentation structure in a project.

#### Scenario: Initialize new project
- Given a project without zywiki configuration
- When user runs `zywiki init`
- Then `.zywiki/config.json` MUST be created with default settings
- And `.zywiki/metadata.json` MUST be created empty
- And `zywiki/` directory structure MUST be created
- And `zywiki/index.md` MUST be created with template content

#### Scenario: Interactive initialization
- Given a project without zywiki configuration
- When user runs `zywiki init`
- Then user MUST be prompted to select AI provider (Claude/Gemini)
- And user MUST be prompted to select language (10 options)
- And if Gemini selected, user MUST be prompted for API key
- And source directories MUST be auto-detected
- And user MUST be asked to scan and add detected files

#### Scenario: Initialize with Claude Code integration
- Given a project without zywiki configuration
- When user runs `zywiki init --claude`
- Then standard initialization MUST occur
- And `.claude/settings.local.json` MUST be updated with hooks

### Requirement: File Tracking
The `zywiki add` command SHALL register files for documentation tracking.

#### Scenario: Add single file
- Given an initialized zywiki project
- When user runs `zywiki add src/lib/service.ts`
- Then the file MUST be added to `.zywiki/metadata.json` snippets
- And file hash MUST be calculated and stored
- And success message MUST be displayed

#### Scenario: Add directory recursively
- Given an initialized zywiki project
- When user runs `zywiki add src/lib/ --recursive`
- Then all matching files in directory MUST be added to metadata
- And count of added files MUST be displayed

### Requirement: AI Document Generation
The `zywiki build` command SHALL generate documentation using AI.

#### Scenario: Build with AI prompts
- Given tracked files in metadata
- When user runs `zywiki build --prompt`
- Then files MUST be grouped by feature/folder
- And AI provider MUST be called for each group
- And generated documents MUST be saved to appropriate category
- And progress MUST be displayed with spinner

#### Scenario: Build with Gemini API
- Given Gemini configured as AI provider
- When user runs `zywiki build --prompt`
- Then Gemini API MUST be called with proper prompt
- And 6.5 second delay MUST be applied between requests
- And rate limit errors MUST trigger 60 second wait

#### Scenario: Build with Claude CLI
- Given Claude configured as AI provider
- When user runs `zywiki build --prompt`
- Then Claude CLI MUST be invoked with Haiku model
- And output MUST be parsed from JSON response

### Requirement: Individual Document Generation
The `zywiki generate` command SHALL create documentation for specific files.

#### Scenario: Generate document for tracked file
- Given a file tracked in metadata
- When user runs `zywiki generate src/lib/service.ts`
- Then a new markdown document MUST be created in appropriate category
- And document MUST include cite block with file reference
- And metadata MUST be updated with document-file relationship

### Requirement: Change Detection
The `zywiki detect` command SHALL identify changed files and affected documents.

#### Scenario: Detect changed files
- Given tracked files in metadata
- When user runs `zywiki detect`
- Then file hashes MUST be compared with stored values
- And changed files MUST be identified
- And affected documents MUST be determined
- And results MUST be displayed

#### Scenario: No changes detected
- Given tracked files with no modifications
- When user runs `zywiki detect`
- Then message MUST indicate no changes found

### Requirement: Status Display
The `zywiki status` command SHALL show current tracking state.

#### Scenario: Display status
- Given an initialized zywiki project
- When user runs `zywiki status`
- Then count of tracked files MUST be displayed
- And count of documents MUST be displayed
- And AI provider configuration MUST be displayed

### Requirement: Sync Prompt Generation
The `zywiki sync` command SHALL generate update prompts for AI assistants.

#### Scenario: Generate sync prompt
- Given pending updates in metadata
- When user runs `zywiki sync`
- Then a formatted prompt MUST be output
- And prompt MUST include changed files list
- And prompt MUST include affected documents list

## Generated Document Format

### Requirement: Document Structure
Generated documents SHALL follow a consistent format.

#### Scenario: Document content structure
- Given a file to document
- When document is generated
- Then document MUST start with `<cite>file/path</cite>` block
- And document MUST include 개요 section (2-3 sentences)
- And document MUST include 2-3 Mermaid diagrams
- And document MUST include 주요 함수/클래스 section (list format)
- And document MUST include 설정/사용법 section with code examples
- And document MUST include 문제 해결 가이드 section

#### Scenario: Language support
- Given language setting in config
- When document is generated
- Then document MUST be written in specified language
- And language-specific instructions MUST be included in AI prompt

## Supported Languages

| Code | Language |
|------|----------|
| en | English |
| es | Español |
| fr | Français |
| ja | 日本語 |
| ko | 한국어 |
| pt-br | Português |
| ru | Русский |
| vi | Tiếng Việt |
| zh | 简体中文 |
| zh-tw | 繁體中文 |

## AI Provider Configuration

### Gemini API
- Model: `gemini-2.5-flash`
- Rate limit: 15 requests per minute
- Delay: 6.5 seconds between requests
- API Key: `GEMINI_API_KEY` environment variable or config

### Claude Code CLI
- Model: `haiku` (fast & cheap)
- Output format: JSON
- Timeout: 5 minutes per request
