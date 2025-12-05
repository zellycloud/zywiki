# Tasks: SQL 스키마 문서화

## Group 1: 기반 구조

- [ ] task-1-1: UnifiedSchema 타입 정의 (lib/types/schema.d.ts)
- [ ] task-1-2: schema 명령어 진입점 생성 (lib/commands/schema.mjs)
- [ ] task-1-3: 자동 감지 모듈 구현 (lib/schema/detector.mjs)

## Group 2: 파서 구현

- [ ] task-2-1: Prisma 파서 구현 (lib/parsers/prisma.mjs)
- [ ] task-2-2: Drizzle 파서 구현 (lib/parsers/drizzle.mjs)
- [ ] task-2-3: SQL 파서 구현 (lib/parsers/sql.mjs)
- [ ] task-2-4: DB Introspection 구현 (lib/parsers/introspection.mjs)

## Group 3: 출력 렌더러

- [ ] task-3-1: 마크다운 렌더러 구현 (lib/schema/renderer.mjs)
- [ ] task-3-2: JSON 출력 구현 (--json 플래그)
- [ ] task-3-3: zywiki/database/ 폴더에 테이블별 파일 생성

## Group 4: 통합 및 테스트

- [ ] task-4-1: CLI 옵션 파싱 (--prisma, --drizzle, --sql, --db, --auto)
- [ ] task-4-2: Prisma 프로젝트 테스트
- [ ] task-4-3: Drizzle 프로젝트 테스트
- [ ] task-4-4: SQL 마이그레이션 테스트

## Group 5: 문서화

- [ ] task-5-1: README에 schema 명령어 문서 추가
- [ ] task-5-2: CHANGELOG 업데이트
- [ ] task-5-3: 버전 0.5.0으로 업데이트
