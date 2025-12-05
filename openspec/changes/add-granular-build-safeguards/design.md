# Design: 세분화 빌드 + 안전장치

## 아키텍처

```
┌─────────────────────────────────────────────────────────┐
│                    build 명령어                          │
├─────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────┐  │
│  │              Filter Pipeline                      │  │
│  │  --file → --path → --stale-only → --filter       │  │
│  └──────────────────────┬───────────────────────────┘  │
│                         │                               │
│  ┌──────────────────────▼───────────────────────────┐  │
│  │              Safeguard Layer                      │  │
│  │  --max-files → --max-tokens → --timeout          │  │
│  └──────────────────────┬───────────────────────────┘  │
│                         │                               │
│              ┌──────────▼──────────┐                   │
│              │    --dry-run?       │                   │
│              └──────────┬──────────┘                   │
│                    yes / no                            │
│                    ▼       ▼                           │
│              ┌─────────┐ ┌─────────┐                   │
│              │ Preview │ │ Execute │                   │
│              └─────────┘ └─────────┘                   │
└─────────────────────────────────────────────────────────┘
```

## CLI 옵션

### 범위 지정

```bash
# 단일 파일
zywiki build --file src/auth.ts

# 디렉토리
zywiki build --path src/api/

# 오래된 문서만
zywiki build --stale-only

# 태그 필터
zywiki build --filter security

# 조합 가능
zywiki build --path src/api/ --stale-only
```

### 안전장치

```bash
# 미리보기 (실제 빌드 안함)
zywiki build --dry-run

# 토큰 예산 제한
zywiki build --max-tokens 50000

# 파일 수 제한
zywiki build --max-files 10

# 타임아웃 (초)
zywiki build --timeout 300
```

## 종료 코드 체계

```typescript
enum ExitCode {
  SUCCESS = 0,           // 성공
  GENERAL_ERROR = 1,     // 일반 오류
  CONFIG_ERROR = 2,      // 설정 오류 (잘못된 옵션, 파일 없음)
  API_ERROR = 3,         // API 오류 (Claude API 실패)
  BUDGET_EXCEEDED = 4,   // 예산 초과 (--max-tokens 초과)
  TIMEOUT = 5            // 타임아웃
}
```

## 데이터 스키마

### BuildOptions

```typescript
interface BuildOptions {
  // 범위 지정
  file?: string;           // 단일 파일
  path?: string;           // 디렉토리
  staleOnly?: boolean;     // 오래된 것만
  filter?: string;         // 태그 필터

  // 안전장치
  dryRun?: boolean;        // 미리보기
  maxTokens?: number;      // 토큰 예산
  maxFiles?: number;       // 파일 수 제한
  timeout?: number;        // 타임아웃 (초)

  // 출력
  json?: boolean;          // JSON 출력
}
```

### BuildResult (JSON 출력)

```typescript
interface BuildResult {
  success: boolean;
  exitCode: number;
  dryRun: boolean;

  // 결과
  processed: string[];     // 처리된 파일
  skipped: string[];       // 건너뛴 파일
  errors: BuildError[];    // 오류 목록

  // 통계
  stats: {
    filesProcessed: number;
    filesSkipped: number;
    tokensUsed: number;
    tokensRemaining?: number;  // --max-tokens 사용 시
    duration: number;          // 밀리초
  };

  // 예산 정보 (제한 설정 시)
  budget?: {
    maxTokens?: number;
    maxFiles?: number;
    timeout?: number;
    exceeded: boolean;
    exceededReason?: 'tokens' | 'files' | 'timeout';
  };
}

interface BuildError {
  file: string;
  message: string;
  code: string;
}
```

## dry-run 출력

```bash
$ zywiki build --dry-run --json

{
  "dryRun": true,
  "wouldProcess": [
    { "file": "src/auth.ts", "docPath": "zywiki/security/auth.md", "reason": "stale" },
    { "file": "src/api/users.ts", "docPath": "zywiki/api/users.md", "reason": "new" }
  ],
  "wouldSkip": [
    { "file": "src/utils/date.ts", "reason": "fresh" }
  ],
  "estimatedTokens": 25000,
  "estimatedCost": "$0.075"
}
```

## 필터 파이프라인

```typescript
async function filterFiles(allFiles: string[], options: BuildOptions): Promise<string[]> {
  let files = allFiles;

  // 1. --file: 단일 파일만
  if (options.file) {
    files = files.filter(f => f === options.file);
  }

  // 2. --path: 디렉토리 필터
  if (options.path) {
    files = files.filter(f => f.startsWith(options.path));
  }

  // 3. --stale-only: 오래된 문서만
  if (options.staleOnly) {
    files = await filterStaleFiles(files);
  }

  // 4. --filter: 태그 필터
  if (options.filter) {
    files = await filterByTag(files, options.filter);
  }

  // 5. --max-files: 파일 수 제한
  if (options.maxFiles && files.length > options.maxFiles) {
    files = files.slice(0, options.maxFiles);
  }

  return files;
}
```

## 예산 관리

```typescript
class BudgetManager {
  private tokensUsed = 0;
  private startTime: number;

  constructor(private options: BuildOptions) {
    this.startTime = Date.now();
  }

  addTokens(count: number): void {
    this.tokensUsed += count;
  }

  checkBudget(): { ok: boolean; reason?: string } {
    // 토큰 예산 확인
    if (this.options.maxTokens && this.tokensUsed >= this.options.maxTokens) {
      return { ok: false, reason: 'tokens' };
    }

    // 타임아웃 확인
    if (this.options.timeout) {
      const elapsed = (Date.now() - this.startTime) / 1000;
      if (elapsed >= this.options.timeout) {
        return { ok: false, reason: 'timeout' };
      }
    }

    return { ok: true };
  }
}
```

## 파일 구조

```
lib/
├── build/
│   ├── filter.mjs        # 파일 필터링
│   ├── budget.mjs        # 예산 관리
│   ├── safeguards.mjs    # 안전장치 적용
│   └── dry-run.mjs       # dry-run 처리
├── commands/
│   └── build.mjs         # 기존 파일 수정
└── constants/
    └── exit-codes.mjs    # 종료 코드 정의
```
