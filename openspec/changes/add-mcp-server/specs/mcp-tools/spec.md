# MCP Tools

## ADDED Requirements

### Requirement: MCP protocol compliance

시스템은 Model Context Protocol 사양을 준수하는 서버를 구현해야 합니다(MUST).

#### Scenario: Connect MCP client

**Given** MCP 클라이언트 (Claude Code)
**When** zywiki-mcp 서버에 연결
**Then** 도구 목록 조회 가능
**And** 도구 실행 가능

#### Scenario: List tools returns all tools

**Given** tools/list 요청
**When** 서버 응답
**Then** 5개 도구 정의 반환됨 (status, search, build, schema, analyze)
**And** 각 도구에 inputSchema 포함됨

---

### Requirement: zywiki_status tool

시스템은 zywiki_status 도구를 통해 문서화 상태를 조회할 수 있어야 합니다(MUST).

#### Scenario: Get project status

**Given** 초기화된 ZyWiki 프로젝트
**When** zywiki_status 호출
**Then** 트래킹/문서화 통계 반환됨
**And** 파일별 상태 목록 포함됨

#### Scenario: Get single file status

**Given** file 파라미터 지정
**When** zywiki_status({ file: "src/auth.ts" }) 호출
**Then** 해당 파일 상태만 반환됨

---

### Requirement: zywiki_search tool

시스템은 zywiki_search 도구를 통해 문서 검색을 수행할 수 있어야 합니다(MUST).

#### Scenario: Search documents by query

**Given** 문서화된 프로젝트
**When** zywiki_search({ query: "authentication" }) 호출
**Then** 관련 문서 검색 결과 반환됨
**And** 각 결과에 파일 경로, 관련 내용 포함됨

#### Scenario: Limit search results

**Given** limit 파라미터 지정
**When** zywiki_search({ query: "auth", limit: 3 }) 호출
**Then** 최대 3개 결과 반환됨

---

### Requirement: zywiki_build tool with safeguards

시스템은 zywiki_build 도구를 통해 안전하게 문서를 빌드할 수 있어야 합니다(MUST).

#### Scenario: Dry-run build

**Given** dryRun: true 설정
**When** zywiki_build({ dryRun: true }) 호출
**Then** 실제 빌드 없이 미리보기 반환됨
**And** 예상 토큰 수 포함됨

#### Scenario: Budget exceeded error

**Given** maxTokens 설정
**When** zywiki_build({ maxTokens: 10000 }) 호출
**And** 예산 초과 시
**Then** isError: true 응답
**And** BUDGET_EXCEEDED 에러 코드 반환됨

#### Scenario: Build single file

**Given** file 파라미터 지정
**When** zywiki_build({ file: "src/auth.ts" }) 호출
**Then** 단일 파일만 빌드됨

---

### Requirement: zywiki_schema tool

시스템은 zywiki_schema 도구를 통해 DB 스키마를 조회할 수 있어야 합니다(MUST).

#### Scenario: Auto-detect and return schema

**Given** Prisma 프로젝트
**When** zywiki_schema({ auto: true }) 호출
**Then** 스키마 정보 JSON 반환됨
**And** tables 배열 포함됨

#### Scenario: Include ER diagram

**Given** diagram: true 설정
**When** zywiki_schema({ auto: true, diagram: true }) 호출
**Then** Mermaid ER 다이어그램 포함됨

---

### Requirement: zywiki_analyze tool

시스템은 zywiki_analyze 도구를 통해 문서화 필요성을 분석할 수 있어야 합니다(MUST).

#### Scenario: Analyze urgent files

**Given** 문서화되지 않은 복잡한 파일 존재
**When** zywiki_analyze() 호출
**Then** urgent 목록에 해당 파일 포함됨
**And** priority와 reason 포함됨

#### Scenario: Analyze stale files

**Given** 오래된 문서 존재
**When** zywiki_analyze() 호출
**Then** stale 목록에 해당 파일 포함됨
**And** staleDays 포함됨

---

### Requirement: Structured error responses

시스템은 에러 발생 시 구조화된 에러 응답을 반환해야 합니다(SHALL).

#### Scenario: Invalid project path error

**Given** 잘못된 프로젝트 경로
**When** 도구 호출
**Then** isError: true 응답
**And** error.code, error.message 포함됨

#### Scenario: API key missing error

**Given** API 키 없음
**When** zywiki_build 호출
**Then** API_ERROR 에러 코드 반환됨
