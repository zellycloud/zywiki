# add-sql-schema-docs

SQL 스키마를 자동으로 문서화하여 에이전트의 DB 이해도를 향상시킵니다.

## 버전

v0.5.0

## 배경

에이전트가 코드를 이해할 때 DB 구조 파악이 필수적입니다. 현재는 수동으로 스키마 파일을 읽어야 하며, ORM별로 형식이 달라 일관된 이해가 어렵습니다.

## 목표

- 다양한 ORM 스키마 파일 지원 (Prisma, Drizzle, TypeORM)
- raw SQL 마이그레이션 파일 파싱
- DB 직접 연결을 통한 introspection
- 일관된 마크다운 + JSON 출력

## 범위

### 포함

- `zywiki schema` 명령어 추가
- Prisma schema.prisma 파싱
- Drizzle schema.ts 파싱
- raw SQL 파싱
- DB 직접 연결 (SQLite, PostgreSQL)
- 자동 감지 기능 (`--auto`)
- JSON 출력 (`--json`)

### 제외

- TypeORM 지원 (복잡도로 인해 v0.5.0에서 제외)
- MongoDB 등 NoSQL 지원
- 스키마 마이그레이션 생성

## 성공 기준

1. Prisma 프로젝트에서 `zywiki schema --auto`로 스키마 문서 생성
2. Drizzle 프로젝트에서 동일하게 작동
3. `--json` 출력으로 테이블, 컬럼, 관계 정보 구조화
4. `zywiki/database/` 폴더에 테이블별 마크다운 생성

## 의존성

- v0.4.0 (JSON 출력 기반 구조)
