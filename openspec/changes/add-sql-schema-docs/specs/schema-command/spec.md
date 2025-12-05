# Schema Command

## ADDED Requirements

### Requirement: Auto-detect schema source

시스템은 프로젝트의 스키마 소스를 자동으로 감지해야 합니다(MUST). Prisma, Drizzle, SQL 마이그레이션 순서로 감지합니다.

#### Scenario: Auto-detect Prisma project

**Given** prisma/schema.prisma 파일이 존재하는 프로젝트
**When** `zywiki schema --auto` 실행
**Then** Prisma 파서가 선택됨
**And** 스키마 정보가 출력됨

#### Scenario: Auto-detect Drizzle project

**Given** drizzle.config.ts 파일이 존재하는 프로젝트
**When** `zywiki schema --auto` 실행
**Then** Drizzle 파서가 선택됨

#### Scenario: Auto-detect Supabase SQL migrations

**Given** supabase/migrations/ 디렉토리가 존재하는 프로젝트
**When** `zywiki schema --auto` 실행
**Then** SQL 파서가 선택됨

#### Scenario: No schema source detected

**Given** 스키마 소스가 없는 프로젝트
**When** `zywiki schema --auto` 실행
**Then** 오류 메시지 출력
**And** 사용 가능한 옵션 안내

---

### Requirement: Parse Prisma schema

시스템은 Prisma schema.prisma 파일을 파싱하여 UnifiedSchema로 변환해야 합니다(MUST).

#### Scenario: Parse Prisma models and relations

**Given** prisma/schema.prisma 파일에 users, posts 모델 정의
**When** `zywiki schema --prisma prisma/schema.prisma` 실행
**Then** 모든 model이 Table로 변환됨
**And** 모든 필드가 Column으로 변환됨
**And** @relation이 Relation으로 변환됨

#### Scenario: Parse Prisma enums

**Given** prisma/schema.prisma 파일에 enum 정의
**When** `zywiki schema --prisma prisma/schema.prisma` 실행
**Then** enum이 Enum 객체로 변환됨

---

### Requirement: JSON output for schema

시스템은 --json 플래그 사용 시 구조화된 JSON을 출력해야 합니다(MUST).

#### Scenario: Schema outputs valid JSON

**Given** 유효한 스키마 소스
**When** `zywiki schema --json` 실행
**Then** 유효한 JSON이 stdout으로 출력됨
**And** tables 배열 포함
**And** 각 테이블에 name, columns, relations 포함

#### Scenario: Schema without --json outputs markdown

**Given** 유효한 스키마 소스
**When** `zywiki schema` 실행 (--json 없이)
**Then** 마크다운 형식으로 출력됨

---

### Requirement: Generate markdown documentation

시스템은 zywiki/database/ 폴더에 테이블별 마크다운 파일을 생성해야 합니다(SHALL).

#### Scenario: Generate table documentation files

**Given** users, posts 테이블이 있는 스키마
**When** `zywiki schema` 실행
**Then** zywiki/database/users.md 생성됨
**And** zywiki/database/posts.md 생성됨

#### Scenario: Include source reference in documentation

**Given** 스키마 문서 생성
**When** 문서 파일 확인
**Then** 각 파일에 `<cite>` 태그로 소스 참조 포함

---

### Requirement: Database introspection

시스템은 --db 옵션으로 데이터베이스에 직접 연결하여 스키마를 추출해야 합니다(MUST).

#### Scenario: Introspect SQLite database

**Given** SQLite 데이터베이스 파일
**When** `zywiki schema --db sqlite:./data.db` 실행
**Then** sqlite_master에서 스키마 추출
**And** UnifiedSchema로 변환됨

#### Scenario: Introspect PostgreSQL database

**Given** PostgreSQL 연결 문자열
**When** `zywiki schema --db postgres://localhost/mydb` 실행
**Then** information_schema에서 스키마 추출됨
