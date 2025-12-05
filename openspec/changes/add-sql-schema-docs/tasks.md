# Tasks: SQL 스키마 문서화

ZyWiki v0.5.0 - SQL 스키마 문서화

## Phase 1: 기반 구조

- [ ] UnifiedSchema 타입 정의 (lib/types/schema.d.ts)
- [ ] schema 명령어 진입점 생성 (lib/commands/schema.mjs)
- [ ] 자동 감지 모듈 구현 (lib/schema/detector.mjs)

## Phase 2: 파서 구현

- [ ] Prisma 파서 구현 (lib/parsers/prisma.mjs)
- [ ] Drizzle 파서 구현 (lib/parsers/drizzle.mjs)
- [ ] SQL 파서 구현 (lib/parsers/sql.mjs)
- [ ] DB Introspection 구현 (lib/parsers/introspection.mjs)

## Phase 3: 출력 렌더러

- [ ] 마크다운 렌더러 구현 (lib/schema/renderer.mjs)
- [ ] JSON 출력 구현 (--json 플래그)
- [ ] zywiki/database/ 폴더에 테이블별 파일 생성

## Phase 4: 통합 및 테스트

- [ ] CLI 옵션 파싱 (--prisma, --drizzle, --sql, --db, --auto)
- [ ] Prisma 프로젝트 테스트
- [ ] Drizzle 프로젝트 테스트
- [ ] SQL 마이그레이션 테스트

## Phase 5: 문서화

- [ ] README에 schema 명령어 문서 추가
- [ ] CHANGELOG 업데이트
- [ ] 버전 0.5.0으로 업데이트
