# zywiki

AI-powered Code Wiki Generator - Generate documentation with Gemini (free) or Claude

## Features

- **AI Documentation**: Generate comprehensive documentation using Gemini API (free) or Claude Code CLI
- **Tech Stack Detection**: Automatically detect frameworks, services, and integrations
- **Multi-language Code Support**: JavaScript, TypeScript, Python, Go, Rust, Java, Swift, and more
- **Smart Grouping**: Automatically groups related files by folder structure
- **10 Output Languages**: English, Korean, Japanese, Chinese, Spanish, French, and more
- **Mermaid Diagrams**: Auto-generated architecture and data flow diagrams
- **Rate Limit Friendly**: Built-in delay between API calls for Gemini free tier

## Installation

```bash
npm install -g zywiki
```

## Quick Start

```bash
# Initialize in your project
zywiki init

# Analyze your tech stack
zywiki stack

# Generate documentation
zywiki build
```

## Commands

| Command | Description |
|---------|-------------|
| `zywiki init` | Initialize documentation structure |
| `zywiki build` | Generate all documentation (prompts if docs exist) |
| `zywiki build --json` | Output build results as JSON |
| `zywiki build --force` | Skip confirmation and rebuild all |
| `zywiki update` | Update only pending documents (changed source files) |
| `zywiki status` | Show tracking status with tech summary |
| `zywiki status --json` | Output status as JSON |
| `zywiki search <query>` | Search wiki documents (semantic + keyword) |
| `zywiki stack` | Analyze and display project tech stack |
| `zywiki stack --json` | Output tech stack as JSON |

## Tech Stack Detection

Automatically detects your project's frameworks and services:

```bash
zywiki stack
```

```
Tech Stack Analysis
===================

[Languages]
   TypeScript   [################----] 78.5% (142 files)
   JavaScript   [###-----------------] 15.2% (28 files)

[Frameworks & Libraries]
   Frontend:
      - Next.js: React framework with SSR/SSG support
      - React: UI component library
   State Management:
      - TanStack Query: Async state management

[Services & Integrations]
   Database Services:
      - Supabase: Open source Firebase alternative
   AI/ML:
      - OpenAI: AI language models

[Summary]
   Primary Language: TypeScript
   Total Frameworks: 8
   Total Services:   5
```

### Supported Languages
JavaScript, TypeScript, Python, Go, Rust, Java, Kotlin, Swift, C/C++, Ruby, PHP, Shell

### Detected Frameworks (~50)
- **Frontend**: Next.js, React, Vue, Svelte, Angular
- **Backend**: Express, FastAPI, Django, NestJS, Gin, Laravel
- **Mobile**: React Native, Expo, Flutter, SwiftUI
- **Testing**: Jest, Vitest, Playwright, Cypress
- **ORM**: Prisma, Drizzle, TypeORM, Mongoose
- **UI**: Tailwind CSS, shadcn/ui, Material UI

### Detected Services (~80)
- **Database**: Supabase, Firebase, PostgreSQL, MongoDB, Redis
- **Auth**: Clerk, Auth0, NextAuth.js
- **Payment**: Stripe, PayPal
- **Hosting**: Vercel, AWS, Cloudflare
- **AI**: OpenAI, Anthropic, Google AI, LangChain
- **Monitoring**: Sentry, Datadog, PostHog

## AI Providers

### Gemini API (Free)

```bash
export GEMINI_API_KEY=your_key_here
zywiki init  # Select: Gemini API
```

Get your free API key: https://aistudio.google.com/app/apikey

### Claude Code CLI

```bash
zywiki init  # Select: Claude Code CLI
```

## Configuration

`.zywiki/config.json`:

```json
{
  "docsDir": "zywiki",
  "language": "ko",
  "ai": {
    "provider": "gemini",
    "model": "gemini-2.5-flash"
  },
  "sourcePatterns": ["src/**/*.{ts,tsx,js,jsx,mjs}"]
}
```

## Output Languages

English, Español, Français, 日本語, 한국어, Português, Русский, Tiếng Việt, 简体中文, 繁體中文

## Git Hooks Integration

Automatically sync documentation when you commit code changes:

```bash
# Initialize with Git hooks
zywiki init --git

# Or add hooks to existing setup
# (hooks are added to .git/hooks/post-commit)
```

**How it works:**
1. On every `git commit`, zywiki detects changed source files
2. Creates `.claude/auto-docs-update.flag` with pending updates
3. Next Claude Code session automatically picks up the flag
4. Run `zywiki build` to update documentation

## JSON Output

All main commands support `--json` flag for structured output, making ZyWiki AI-agent friendly:

```bash
# Status as JSON
zywiki status --json

# Build with JSON output (skips confirmation, no spinner)
zywiki build --json

# Tech stack as JSON
zywiki stack --json
```

### Example JSON Output

```json
{
  "version": "0.4.0",
  "timestamp": "2025-01-01T00:00:00.000Z",
  "success": true,
  "stats": {
    "trackedFiles": 25,
    "documents": 8,
    "pendingUpdates": 3
  }
}
```

### Manifest File

Build command automatically generates `.zywiki/manifest.json` with document-source mappings:

```json
{
  "version": "0.4.0",
  "generatedAt": "2025-01-01T00:00:00.000Z",
  "stats": {
    "trackedFiles": 25,
    "documents": 8,
    "coveragePercent": 32.0
  },
  "documents": [
    {
      "path": "zywiki/features/auth.md",
      "sources": ["src/auth/login.ts", "src/auth/logout.ts"]
    }
  ]
}
```

## Changelog

### v0.4.0
- **New**: JSON output for all CLI commands (`--json` flag)
  - `zywiki status --json`: Structured status information
  - `zywiki build --json`: Build results report
  - `zywiki stack --json`: Tech stack information
- **New**: Automatic manifest generation (`.zywiki/manifest.json`)
  - Document-source file mappings
  - Coverage percentage calculation
- **New**: TypeScript type definitions for JSON output schemas

### v0.3.0
- **New**: RAG Search - Local semantic search using Orama + Transformers.js
  - `zywiki search <query>`: Hybrid search (BM25 + vector)
  - Auto-index after `build` and `update` commands
  - Multilingual support with multilingual-e5-small model
- **Changed**: Build/Update command semantics redesigned
  - `build`: Full documentation generation (prompts if docs exist)
  - `update`: Only update pending documents (changed source files)
- **Changed**: CLI simplified from 11 to 6 commands
- **Improved**: Status display with build progress info

### v0.2.8
- **Fixed**: `zywiki build` now clears pending.json after successful generation
- **Fixed**: Status output limited to 5 items with summary count

### v0.2.6
- **New**: Auto-detect Git and Claude Code for interactive setup
- **Changed**: `zywiki init` now prompts for Git/Claude integration instead of requiring flags
- **Fixed**: Preserve metadata.json on `--force` to prevent unnecessary rebuilds

### v0.2.5
- **Fixed**: Critical import error in git-hooks.mjs
- **Changed**: Added `.zyflow/` to `.gitignore`

### v0.2.4
- **New**: Git hooks integration for automatic documentation sync
- **New**: Auto-create `.claude/auto-docs-update.flag` on commit for Claude Code session detection
- **New**: `--git` flag in `zywiki init` to setup Git post-commit hooks
- **Improved**: Better integration with Claude Code workflow

### v0.2.3
- **New**: Auto-update `CLAUDE.md` with zywiki instructions on `init` and `update`
- **New**: Added AI usage guide in `CLAUDE.md` for better AI assistant integration
- **Improved**: Wiki structure documentation and commands reference

### v0.2.2
- **Bug Fix**: Fixed glob pattern matching for `**/*.sql` and similar patterns
- **Improved**: `zywiki update` now defaults to "No" for settings change prompt (just press Enter to skip)
- **Improved**: API key is no longer re-requested if already configured

### v0.2.1
- Added `zywiki update` command for configuration changes
- Auto-generate `overview.md` on init
- Added Zellycloud credit

### v0.2.0
- Added tech stack detection (`zywiki stack`)
- Support for 12+ programming languages
- Detect 50+ frameworks and 80+ services

## Author

Made with love by [Zellycloud](https://zellyy.com)

## License

MIT
