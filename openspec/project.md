# zywiki - AI-Powered Code Wiki Generator

## Overview

zywiki는 AI를 활용하여 코드베이스의 기술 문서를 자동으로 생성하는 오픈소스 CLI 도구입니다. Gemini API(무료) 또는 Claude Code CLI와 통합되어 프로젝트 문서화를 자동화합니다.

## Project Info

| 항목 | 값 |
|------|-----|
| 패키지명 | `zywiki` |
| 현재 버전 | 0.1.1 |
| npm | https://www.npmjs.com/package/zywiki |
| GitHub | https://github.com/zellycloud/zywiki |
| 라이선스 | MIT |
| Node.js | >= 18.0.0 |

## Tech Stack

- **Runtime**: Node.js 18+
- **Module System**: ESM (`.mjs`)
- **CLI Framework**: Commander.js
- **AI Providers**:
  - Gemini API (gemini-2.5-flash) - 무료
  - Claude Code CLI (Haiku)
- **Dependencies**: Commander.js만 사용 (최소 의존성)

## Key Features

1. **AI Documentation**: Gemini API(무료) 또는 Claude Code CLI로 문서 자동 생성
2. **Smart Grouping**: 폴더 구조와 네이밍 패턴으로 관련 파일 자동 그룹화
3. **Multi-language**: 10개 언어 지원 (한국어, 영어, 일본어, 중국어 등)
4. **Mermaid Diagrams**: 아키텍처, 데이터 흐름, 의존성 다이어그램 자동 생성
5. **Rate Limit Friendly**: Gemini 무료 티어를 위한 6.5초 딜레이 내장

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

## Directory Structure

```
project-root/
├── .zywiki/
│   ├── config.json      # Configuration
│   └── metadata.json    # File-document mapping
└── zywiki/
    ├── architecture/    # Architecture docs
    ├── features/        # Feature docs
    ├── api/             # API reference
    ├── database/        # Database docs
    ├── guides/          # Guide docs
    └── index.md         # Documentation index
```

## Changes

- [create-zywiki-package](./changes/create-zywiki-package/proposal.md) - Initial package creation (v0.1.0 → v0.1.1)

## Development Guidelines

- Commit messages in English
- Use ESM modules (.mjs)
- Minimal dependencies (Commander.js only)
- Support Node.js 18+
