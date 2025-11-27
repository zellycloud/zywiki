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
| `zywiki add <path>` | Register files for tracking |
| `zywiki build` | Generate AI documentation |
| `zywiki stack` | Analyze and display project tech stack |
| `zywiki stack --save` | Save tech stack as markdown |
| `zywiki status` | Show tracking status with tech summary |
| `zywiki detect` | Detect changed files |
| `zywiki sync` | Generate update prompt |
| `zywiki update` | Update config and re-scan project |

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

## Changelog

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
