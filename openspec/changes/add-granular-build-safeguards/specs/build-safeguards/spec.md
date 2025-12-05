# Build Safeguards

## ADDED Requirements

### Requirement: Granular file selection

시스템은 파일, 디렉토리, 태그 단위로 빌드 범위를 지정할 수 있어야 합니다(MUST).

#### Scenario: Build single file with --file

**Given** src/auth.ts 파일이 트래킹됨
**When** `zywiki build --file src/auth.ts` 실행
**Then** src/auth.ts만 빌드됨
**And** 다른 파일은 건너뜀

#### Scenario: Build directory with --path

**Given** src/api/ 디렉토리에 3개 파일 존재
**When** `zywiki build --path src/api/` 실행
**Then** src/api/ 하위 파일만 빌드됨

#### Scenario: Build stale files only

**Given** 5일 전 문서화된 파일과 오늘 문서화된 파일
**When** `zywiki build --stale-only` 실행
**Then** 오래된 파일만 빌드됨

#### Scenario: Build filtered by tag

**Given** security 태그가 붙은 파일 2개 존재
**When** `zywiki build --filter security` 실행
**Then** security 태그 파일만 빌드됨

---

### Requirement: Dry-run mode

시스템은 --dry-run 옵션으로 실제 빌드 없이 미리보기를 제공해야 합니다(MUST).

#### Scenario: Dry-run does not call Claude API

**Given** 빌드 대상 파일 5개
**When** `zywiki build --dry-run` 실행
**Then** Claude API 호출 없음
**And** wouldProcess 목록 출력

#### Scenario: Dry-run shows estimated tokens

**Given** 빌드 대상 파일 존재
**When** `zywiki build --dry-run` 실행
**Then** 예상 토큰 수 출력됨

#### Scenario: Dry-run with JSON output

**Given** --dry-run과 --json 함께 사용
**When** `zywiki build --dry-run --json` 실행
**Then** JSON 형식으로 미리보기 결과 출력됨

---

### Requirement: Token budget limit

시스템은 --max-tokens 옵션으로 토큰 사용량을 제한해야 합니다(MUST).

#### Scenario: Build stops when budget exceeded

**Given** --max-tokens 10000 설정
**And** 빌드 중 누적 토큰 10000 도달
**When** 다음 파일 빌드 시도
**Then** 빌드 중단됨
**And** 종료 코드 4 (BUDGET_EXCEEDED) 반환

#### Scenario: JSON output shows budget exceeded

**Given** --max-tokens 초과로 빌드 중단
**When** JSON 출력 확인
**Then** budget.exceeded = true 포함됨

#### Scenario: No token limit when flag not set

**Given** --max-tokens 미설정
**When** `zywiki build` 실행
**Then** 토큰 제한 없이 전체 빌드

---

### Requirement: File count limit

시스템은 --max-files 옵션으로 빌드할 파일 수를 제한해야 합니다(MUST).

#### Scenario: Limit files with --max-files

**Given** 빌드 대상 파일 20개
**And** --max-files 10 설정
**When** `zywiki build --max-files 10` 실행
**Then** 10개 파일만 빌드됨
**And** 나머지 10개는 skipped로 보고됨

#### Scenario: Combine max-files with stale-only

**Given** 오래된 파일 8개 존재
**When** `zywiki build --stale-only --max-files 5` 실행
**Then** 오래된 파일 중 5개만 빌드됨

---

### Requirement: Timeout option

시스템은 --timeout 옵션으로 빌드 시간을 제한해야 합니다(MUST).

#### Scenario: Build times out

**Given** --timeout 60 설정 (60초)
**And** 빌드 시간 60초 초과
**When** 타임아웃 발생
**Then** 빌드 중단됨
**And** 종료 코드 5 (TIMEOUT) 반환

#### Scenario: Completed files included on timeout

**Given** 타임아웃으로 빌드 중단
**When** 결과 확인
**Then** 완료된 파일은 결과에 포함됨

---

### Requirement: Exit code system

시스템은 오류 유형에 따라 구분된 종료 코드를 반환해야 합니다(SHALL).

#### Scenario: Exit code 0 on success

**Given** 빌드 성공
**When** 프로세스 종료
**Then** 종료 코드 0 반환

#### Scenario: Exit code 3 on API error

**Given** Claude API 오류 발생
**When** 프로세스 종료
**Then** 종료 코드 3 반환

#### Scenario: Exit code 4 on budget exceeded

**Given** 토큰 예산 초과
**When** 프로세스 종료
**Then** 종료 코드 4 반환

#### Scenario: Exit code 5 on timeout

**Given** 타임아웃 발생
**When** 프로세스 종료
**Then** 종료 코드 5 반환
