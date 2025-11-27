# AGENTS.md - zywiki Development Guidelines

## 0. OpenSpec Workflow

### When to Use OpenSpec
- New features or capabilities
- Breaking changes
- Architecture changes
- Performance/security work

### OpenSpec Structure
```
openspec/
├── project.md              # Project overview
├── AGENTS.md               # This file
└── changes/
    └── {change-name}/
        ├── proposal.md     # Summary, motivation, scope
        ├── design.md       # Architecture, schemas
        ├── tasks.md        # Implementation tasks
        └── specs/
            └── {spec-name}/
                └── spec.md # Detailed requirements
```

## 1. Basic Rules

### Code Style
- Use ESM modules (.mjs)
- Minimal dependencies
- No TypeScript (pure JavaScript)
- Async/await for asynchronous operations

### Commit Messages
- **English only**
- Format: `type(scope): description`
- Types: feat, fix, docs, refactor, test, chore

### File Naming
- Commands: `src/commands/{command}.mjs`
- Core modules: `src/core/{module}.mjs`
- Integrations: `src/integrations/{integration}.mjs`

## 2. Project Structure

```
zywiki/
├── bin/
│   └── zywiki.mjs          # CLI entry point
├── src/
│   ├── index.mjs           # Main module exports
│   ├── commands/           # CLI commands
│   ├── core/               # Core logic
│   └── integrations/       # External integrations
├── templates/              # Document templates
├── openspec/               # Specifications
└── package.json
```

## 3. AI Provider Guidelines

### Gemini API
- Use `gemini-2.5-flash` model
- Apply 6.5s delay between requests (free tier: 15 RPM)
- Handle rate limit errors with 60s wait
- Store API key in config or environment variable

### Claude Code CLI
- Use `haiku` model for speed
- Parse JSON output format
- 5 minute timeout per request

## 4. Document Generation

### Output Format
1. `<cite>` block with source file
2. Overview section (2-3 sentences)
3. Mermaid diagrams (2-3)
4. Functions/classes list (no tables)
5. Usage examples (1-2 code snippets)
6. Troubleshooting guide (2-3 issues)

### Language Support
- Default: Korean (ko)
- Supported: en, es, fr, ja, ko, pt-br, ru, vi, zh, zh-tw

## 5. Testing

### Manual Testing
```bash
# Test init
zywiki init --force

# Test add
zywiki add src/

# Test build
zywiki build --prompt --filter "core"

# Test status
zywiki status
```

### Before Publishing
1. Test all commands locally
2. Update version with `npm version patch|minor|major`
3. Run `npm publish`
4. Create GitHub release

## 6. Publishing Checklist

- [ ] All commands working
- [ ] README up to date
- [ ] Version bumped
- [ ] Changelog updated
- [ ] npm published
- [ ] GitHub release created
- [ ] Tags pushed
