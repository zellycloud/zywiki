# Design: 자율 운영

## 아키텍처

```
┌─────────────────────────────────────────────────────────┐
│                    자율 운영 시스템                       │
├─────────────────────────────────────────────────────────┤
│                                                          │
│   ┌───────────────┐           ┌───────────────┐         │
│   │   analyze     │           │    watch      │         │
│   │   명령어       │           │    모드       │         │
│   └───────┬───────┘           └───────┬───────┘         │
│           │                           │                  │
│           ▼                           ▼                  │
│   ┌───────────────┐           ┌───────────────┐         │
│   │  Analyzer     │           │  FileWatcher  │         │
│   │  - 복잡도 분석 │           │  - chokidar   │         │
│   │  - 신선도 체크 │           │  - 디바운스   │         │
│   └───────┬───────┘           └───────┬───────┘         │
│           │                           │                  │
│           └───────────┬───────────────┘                  │
│                       ▼                                  │
│           ┌───────────────────────┐                     │
│           │    DailyBudget        │                     │
│           │    Manager            │                     │
│           │  - 토큰 추적          │                     │
│           │  - 예산 체크          │                     │
│           │  - 자정 리셋          │                     │
│           └───────────────────────┘                     │
│                       │                                  │
│                       ▼                                  │
│           ┌───────────────────────┐                     │
│           │    Build Engine       │                     │
│           │    (v0.6.0 안전장치)   │                     │
│           └───────────────────────┘                     │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

## analyze 명령어

### CLI 인터페이스

```bash
# 기본 분석
zywiki analyze

# JSON 출력
zywiki analyze --json

# 특정 디렉토리만
zywiki analyze --path src/api/
```

### 분석 기준

**Urgent (긴급)**
- 문서 없음 + 복잡도 높음 (lines > 200 또는 cyclomatic > 10)
- 문서 없음 + 많은 export (> 5)
- 문서 없음 + 타입 정의 파일 (.d.ts)

**Stale (오래됨)**
- 문서 존재 + 소스 파일이 문서보다 최근 수정
- staleDays > 7

**Suggestions**
- 디렉토리 커버리지 < 50%
- 중요 파일 패턴 (auth, payment, api 등)

### 출력 스키마

```typescript
interface AnalyzeResult {
  urgent: UrgentItem[];
  stale: StaleItem[];
  suggestions: string[];
  summary: {
    totalFiles: number;
    documentedFiles: number;
    urgentCount: number;
    staleCount: number;
    coverage: number;
  };
}

interface UrgentItem {
  file: string;
  reason: string;
  priority: 1 | 2 | 3;  // 1이 가장 긴급
  metrics?: {
    lines?: number;
    complexity?: number;
    exports?: number;
  };
}

interface StaleItem {
  file: string;
  docPath: string;
  staleDays: number;
  priority: 2 | 3;
}
```

## watch 모드

### CLI 인터페이스

```bash
# 기본 watch (경고 표시)
zywiki watch

# 일일 예산 설정 (권장)
zywiki watch --max-daily-tokens 50000

# 디렉토리 제한
zywiki watch --path src/

# 디바운스 시간 설정 (초)
zywiki watch --debounce 5
```

### 동작 흐름

```
파일 저장
    │
    ▼
┌─────────────┐
│ 디바운스    │ ← 연속 저장 대기 (기본 3초)
└─────────┬───┘
          │
          ▼
┌─────────────┐
│ 트래킹 확인 │ ← .zywiki/config.json 확인
└─────────┬───┘
          │
          ▼
┌─────────────┐
│ 예산 확인   │ ← 일일 예산 잔여 확인
└─────────┬───┘
          │
          ▼
┌─────────────┐
│ 빌드 실행   │ ← v0.6.0 build --file 사용
└─────────┬───┘
          │
          ▼
┌─────────────┐
│ 예산 업데이트│ ← 사용 토큰 기록
└─────────────┘
```

### DailyBudget Manager

```typescript
interface DailyBudget {
  date: string;           // YYYY-MM-DD (로컬)
  maxTokens: number;
  usedTokens: number;
  builds: BuildRecord[];
}

interface BuildRecord {
  timestamp: string;
  file: string;
  tokens: number;
  success: boolean;
}

class DailyBudgetManager {
  private budgetFile = '.zywiki/daily-budget.json';

  async checkBudget(estimatedTokens: number): Promise<boolean>;
  async recordUsage(file: string, tokens: number, success: boolean): Promise<void>;
  async resetIfNewDay(): Promise<void>;
  async getRemaining(): Promise<number>;
}
```

### 예산 파일 구조

```json
// .zywiki/daily-budget.json
{
  "date": "2024-01-20",
  "maxTokens": 50000,
  "usedTokens": 12500,
  "builds": [
    { "timestamp": "2024-01-20T10:30:00", "file": "src/auth.ts", "tokens": 5000, "success": true },
    { "timestamp": "2024-01-20T11:15:00", "file": "src/api/users.ts", "tokens": 7500, "success": true }
  ]
}
```

### FileWatcher 구현

```typescript
// lib/watch/watcher.mjs
import chokidar from 'chokidar';
import debounce from 'lodash.debounce';

export class FileWatcher {
  private watcher: chokidar.FSWatcher;
  private budget: DailyBudgetManager;
  private debouncedBuild: Map<string, Function>;

  constructor(options: WatchOptions) {
    this.budget = new DailyBudgetManager(options.maxDailyTokens);
    this.debouncedBuild = new Map();
  }

  start(path: string): void {
    this.watcher = chokidar.watch(path, {
      ignored: /(^|[\/\\])\../, // dotfiles 제외
      persistent: true
    });

    this.watcher.on('change', (filePath) => {
      this.handleChange(filePath);
    });
  }

  private handleChange(file: string): void {
    // 트래킹된 파일인지 확인
    if (!isTracked(file)) return;

    // 디바운스된 빌드 함수 가져오기/생성
    if (!this.debouncedBuild.has(file)) {
      this.debouncedBuild.set(file, debounce(
        () => this.build(file),
        this.options.debounce * 1000
      ));
    }

    this.debouncedBuild.get(file)!();
  }

  private async build(file: string): Promise<void> {
    // 예산 확인
    const estimated = await estimateTokens(file);
    if (!await this.budget.checkBudget(estimated)) {
      console.log(`[watch] 일일 예산 소진: ${file} 빌드 건너뜀`);
      return;
    }

    // 빌드 실행
    const result = await buildFile(file);

    // 예산 기록
    await this.budget.recordUsage(file, result.tokens, result.success);
  }
}
```

## 파일 구조

```
lib/
├── analyze/
│   ├── analyzer.mjs      # 분석 로직
│   ├── complexity.mjs    # 복잡도 계산
│   └── priority.mjs      # 우선순위 결정
├── watch/
│   ├── watcher.mjs       # 파일 감시
│   ├── budget.mjs        # 일일 예산 관리
│   └── debounce.mjs      # 디바운스 유틸
└── commands/
    ├── analyze.mjs
    └── watch.mjs
```

## 안전장치 연동

watch 모드는 v0.6.0의 모든 안전장치를 상속:

```bash
zywiki watch \
  --max-daily-tokens 50000 \  # v1.1.0 신규
  --max-tokens 5000 \          # v0.6.0 (파일당)
  --timeout 60                 # v0.6.0 (파일당)
```
