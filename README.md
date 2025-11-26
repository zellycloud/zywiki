# zellyy-docs (zy-docs)

Code-Documentation Auto Sync CLI for Claude Code

## Features

- **Auto Detection**: Automatically detect code changes and identify affected documentation
- **Claude Code Native**: Seamless integration with Claude Code hooks (PostToolUse, SessionEnd)
- **Local First**: No external service dependencies
- **Simple CLI**: Get started with `npx zy-docs init`

## Installation

```bash
npm install -g zellyy-docs
# or use with npx
npx zy-docs init
```

## Quick Start

```bash
# Initialize in your project
zy-docs init --claude

# Add files to track
zy-docs add src/lib/

# Check status
zy-docs status

# Detect changes
zy-docs detect

# Generate sync prompt for AI
zy-docs sync --format prompt
```

## Commands

| Command | Description |
|---------|-------------|
| `zy-docs init` | Initialize documentation structure |
| `zy-docs add <path>` | Register files for tracking |
| `zy-docs generate <path>` | Generate documentation template |
| `zy-docs detect` | Detect changed files |
| `zy-docs status` | Show tracking status |
| `zy-docs sync` | Generate update prompt |

## Claude Code Integration

When you run `zy-docs init --claude`, it automatically sets up:

1. **PostToolUse Hook**: Detects changes after file edits
2. **SessionEnd Hook**: Generates sync summary
3. **CLAUDE.md**: Instructions for auto-updating docs

## Configuration

`.zy-docs/config.json`:

```json
{
  "version": "1.0.0",
  "docsDir": "docs",
  "sourcePatterns": ["src/**/*.{ts,tsx,js,jsx}"],
  "ignorePatterns": ["**/*.test.ts", "**/node_modules/**"],
  "categories": {
    "src/lib/": "features",
    "src/components/": "features",
    "src/api/": "api"
  }
}
```

## License

MIT
