# Design: add-json-output

## Overview

ZyWiki CLI의 모든 주요 명령에 `--json` 플래그를 추가하여 AI 에이전트가 프로그래밍적으로 결과를 활용할 수 있게 합니다.

## Architecture

### 현재 구조

```
src/commands/
├── build.mjs      # console.log() 사용
├── status.mjs     # console.log() 사용
├── stack.mjs      # console.log() 사용
├── search-cmd.mjs # --json 지원 ✓
└── update.mjs     # console.log() 사용
```

### 변경 후 구조

```
src/commands/
├── build.mjs      # --json 지원 추가
├── status.mjs     # --json 지원 추가
├── stack.mjs      # --json 지원 추가
├── search-cmd.mjs # 기존 유지
└── update.mjs     # --json 지원 추가

src/core/
└── output.mjs     # (신규) JSON/텍스트 출력 유틸리티
```

## JSON Output Schemas

### 1. status --json

```typescript
interface StatusOutput {
  version: "1.0";
  timestamp: string;  // ISO 8601
  stats: {
    tracked: number;
    documented: number;
    pending: number;
    coverage: number;  // percentage
  };
  techStack?: {
    languages: string[];
    frameworks: number;
    services: number;
  };
  pending?: {
    changedFiles: string[];
    affectedDocs: string[];
  };
}
```

### 2. build --json

```typescript
interface BuildOutput {
  version: "1.0";
  timestamp: string;
  success: boolean;
  stats: {
    totalGroups: number;
    generated: number;
    skipped: number;
    errors: number;
  };
  results: {
    path: string;
    status: "created" | "updated" | "skipped" | "error";
    duration?: number;  // ms
    error?: string;
  }[];
  summary: {
    totalDuration: number;  // ms
    tokensUsed?: number;    // if available
  };
}
```

### 3. stack --json

```typescript
interface StackOutput {
  version: "1.0";
  timestamp: string;
  languages: {
    name: string;
    percentage: number;
    files: number;
  }[];
  frameworks: Record<string, string[]>;  // category -> items
  services: Record<string, string[]>;    // category -> items
  summary: {
    totalLanguages: number;
    totalFrameworks: number;
    totalServices: number;
  };
}
```

### 4. manifest.json

```typescript
interface Manifest {
  version: "1.0";
  generatedAt: string;  // ISO 8601
  generator: {
    name: "zywiki";
    version: string;
  };
  documents: {
    docPath: string;
    sourceFiles: string[];
    generatedAt: string;
    hash?: string;
  }[];
  codeToDocMap: Record<string, string>;  // source -> doc
  coverage: {
    tracked: number;
    documented: number;
    percent: number;
  };
}
```

## Implementation Strategy

### Phase 1: Output Utility

`src/core/output.mjs` 생성:

```javascript
export function output(data, options = {}) {
  if (options.json) {
    console.log(JSON.stringify(data, null, 2));
  } else {
    // 기존 텍스트 포맷 유지
    formatText(data);
  }
}
```

### Phase 2: Command Updates

각 명령어에서:
1. `--json` 옵션 추가
2. 결과를 객체로 수집
3. `output()` 함수로 출력

### Phase 3: Manifest Generation

`build` 완료 시 `.zywiki/manifest.json` 자동 생성.

## Backward Compatibility

- `--json` 없으면 기존 텍스트 출력 유지
- 기존 스크립트에 영향 없음
- JSON 스키마에 `version` 필드 추가하여 향후 변경 대비

## Testing Strategy

1. **Unit Tests**: 각 JSON 스키마 검증
2. **Integration Tests**: CLI 실행 → JSON 파싱 → 필드 검증
3. **Snapshot Tests**: 출력 형식 고정

## Migration Path

1. v0.4.0: `--json` 플래그 추가 (opt-in)
2. v1.0.0 (MCP): JSON이 기본 인터페이스
