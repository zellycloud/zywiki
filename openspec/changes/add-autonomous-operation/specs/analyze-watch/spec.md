# Analyze and Watch Mode

## ADDED Requirements

### Requirement: Analyze documentation needs

시스템은 프로젝트의 문서화 필요성을 분석하여 우선순위별로 제시해야 합니다(MUST).

#### Scenario: Identify urgent undocumented files

**Given** 문서화되지 않은 복잡한 파일 (200줄 이상)
**When** `zywiki analyze` 실행
**Then** urgent 목록에 해당 파일 포함됨
**And** priority: 1 설정됨
**And** reason에 복잡도 정보 포함됨

#### Scenario: Identify stale documentation

**Given** 7일 이상 오래된 문서
**When** `zywiki analyze` 실행
**Then** stale 목록에 해당 파일 포함됨
**And** staleDays 포함됨

#### Scenario: Suggest low coverage directories

**Given** 커버리지 50% 미만 디렉토리
**When** `zywiki analyze` 실행
**Then** suggestions에 해당 디렉토리 포함됨

---

### Requirement: Analyze JSON output

시스템은 --json 플래그로 구조화된 분석 결과를 출력해야 합니다(MUST).

#### Scenario: Output structured JSON

**Given** 분석 대상 프로젝트
**When** `zywiki analyze --json` 실행
**Then** JSON 형식 출력됨
**And** urgent, stale, suggestions 필드 포함됨
**And** summary 통계 포함됨

#### Scenario: MCP tool returns same structure

**Given** MCP 서버에서 zywiki_analyze 호출
**When** 도구 실행
**Then** 동일한 JSON 구조 반환됨

---

### Requirement: Watch mode file detection

시스템은 파일 변경을 감지하고 자동으로 문서를 빌드해야 합니다(MUST).

#### Scenario: Auto-build on file save

**Given** zywiki watch 실행 중
**And** src/auth.ts가 트래킹됨
**When** src/auth.ts 파일 저장
**Then** 3초 디바운스 후 빌드 시작됨
**And** zywiki/security/auth.md 업데이트됨

#### Scenario: Ignore untracked files

**Given** 트래킹되지 않은 파일
**When** 해당 파일 저장
**Then** 빌드 실행 안함

---

### Requirement: Watch mode debounce

시스템은 연속 저장 시 디바운스를 적용해야 합니다(MUST).

#### Scenario: Debounce consecutive saves

**Given** zywiki watch --debounce 5 실행 중
**When** 파일 저장 후 2초 후 다시 저장
**Then** 마지막 저장 후 5초 대기
**And** 빌드 1회만 실행됨

#### Scenario: Default debounce timing

**Given** 기본 디바운스 (3초)
**When** 파일 저장 후 3초 이상 대기
**Then** 빌드 실행됨

---

### Requirement: Daily token budget

시스템은 --max-daily-tokens로 일일 토큰 사용량을 제한해야 합니다(MUST).

#### Scenario: Build within daily budget

**Given** --max-daily-tokens 50000 설정
**And** 오늘 사용량 45000 토큰
**When** 예상 5000 토큰 빌드 요청
**Then** 빌드 실행됨

#### Scenario: Skip build when budget exhausted

**Given** --max-daily-tokens 50000 설정
**And** 오늘 사용량 50000 토큰
**When** 추가 빌드 요청
**Then** 빌드 건너뜀
**And** "일일 예산 소진" 메시지 출력됨

#### Scenario: Reset budget at midnight

**Given** 자정 경과
**When** 새로운 날짜
**Then** 사용량 0으로 리셋됨
**And** 빌드 재개됨

---

### Requirement: Budget warning when not set

시스템은 --max-daily-tokens 없이 watch 실행 시 경고를 표시해야 합니다(SHALL).

#### Scenario: Show warning without budget

**Given** --max-daily-tokens 미설정
**When** `zywiki watch` 실행
**Then** 경고 메시지 표시됨
**And** "비용 폭주 위험" 안내됨
**And** 실행은 계속됨

#### Scenario: No warning with budget set

**Given** --max-daily-tokens 설정
**When** `zywiki watch` 실행
**Then** 경고 없이 실행됨
**And** 예산 정보 표시됨

---

### Requirement: Persist daily budget state

시스템은 일일 예산 사용량을 .zywiki/daily-budget.json에 저장해야 합니다(MUST).

#### Scenario: Record usage after build

**Given** 빌드 완료
**When** 토큰 사용량 기록
**Then** .zywiki/daily-budget.json 업데이트됨
**And** builds 배열에 기록 추가됨

#### Scenario: Resume usage on watch restart

**Given** watch 재시작
**When** 같은 날짜
**Then** 이전 사용량 이어서 계산됨
