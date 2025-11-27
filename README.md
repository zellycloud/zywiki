# zywiki

AI-powered Code Wiki Generator - Generate documentation with Gemini (free) or Claude

## Features

- **AI Documentation**: Generate comprehensive documentation using Gemini API (free) or Claude Code CLI
- **Smart Grouping**: Automatically groups related files by folder structure and naming patterns
- **Multi-language**: Support for 10 languages (English, Korean, Japanese, Chinese, etc.)
- **Mermaid Diagrams**: Auto-generated architecture, data flow, and dependency diagrams
- **Rate Limit Friendly**: Built-in 6.5s delay between API calls for Gemini free tier

## Installation

```bash
npm install -g zywiki
```

## Quick Start

```bash
# Initialize in your project
zywiki init

# Select AI provider:
# 1. Claude Code CLI (requires claude cli)
# 2. Gemini API (free, requires GEMINI_API_KEY)

# Select language (10 options available)

# Scan and add source files
# (Interactive prompts guide you through the process)
```

## Commands

| Command | Description |
|---------|-------------|
| `zywiki init` | Initialize documentation structure |
| `zywiki add <path>` | Register files for tracking |
| `zywiki build --prompt` | Generate AI documentation |
| `zywiki generate <path>` | Generate doc for specific file |
| `zywiki detect` | Detect changed files |
| `zywiki status` | Show tracking status |
| `zywiki sync` | Generate update prompt |

## AI Providers

### Gemini API (Recommended - Free)

```bash
# Set API key
export GEMINI_API_KEY=your_key_here

# Or enter during init
zywiki init
# Select: 2. Gemini API
```

Get your free API key at: https://aistudio.google.com/app/apikey

### Claude Code CLI

Requires Claude Code CLI installed and configured.

```bash
zywiki init
# Select: 1. Claude Code CLI
```

## Generated Documentation

Each generated document includes:

- `<cite>` block with source file reference
- Overview section (2-3 sentences)
- Mermaid diagrams (architecture, data flow, dependencies)
- Functions/classes documentation (list format)
- Usage examples (1-2 code snippets)
- Troubleshooting guide (2-3 common issues)

## Configuration

`.zywiki/config.json`:

```json
{
  "version": "1.0.0",
  "docsDir": "zywiki",
  "language": "ko",
  "ai": {
    "provider": "gemini",
    "model": "gemini-2.5-flash",
    "apiKey": null
  },
  "sourcePatterns": ["src/**/*.{ts,tsx,js,jsx}"],
  "ignorePatterns": ["**/*.test.ts", "**/node_modules/**"]
}
```

## Supported Languages

1. English (en)
2. Español (es)
3. Français (fr)
4. 日本語 (ja)
5. 한국어 (ko)
6. Português (pt-br)
7. Русский (ru)
8. Tiếng Việt (vi)
9. 简体中文 (zh)
10. 繁體中文 (zh-tw)

## Example Output

```
zywiki/
├── architecture/
│   ├── agents-BaseAgent.md
│   ├── agents-MessageBus.md
│   └── core-services.md
├── features/
│   ├── components-Button.md
│   └── hooks-useAuth.md
├── api/
│   └── routes-users.md
└── index.md
```

## Rate Limiting

For Gemini free tier:
- 15 requests per minute
- Built-in 6.5s delay between requests
- Automatic retry on rate limit errors

## License

MIT
