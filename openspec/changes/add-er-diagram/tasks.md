# Tasks: ER 다이어그램

ZyWiki v0.7.0 - ER 다이어그램

## Phase 1: ER 생성기 구현

- [ ] DiagramOptions 타입 정의
- [ ] relationToMermaid 함수 구현
- [ ] generateErDiagram 함수 구현 (lib/schema/er.mjs)
- [ ] 관계 유형별 Mermaid 기호 매핑

## Phase 2: CLI 통합

- [ ] --diagram 옵션 추가
- [ ] stdout 다이어그램 출력
- [ ] JSON 출력에 diagram 필드 추가

## Phase 3: 마크다운 통합

- [ ] overview.md 템플릿 생성
- [ ] 테이블 요약 테이블 생성
- [ ] zywiki/database/overview.md 자동 생성

## Phase 4: 테스트

- [ ] 관계 유형별 Mermaid 출력 테스트
- [ ] 빈 관계 처리 테스트
- [ ] 대규모 스키마 테스트 (20+ 테이블)

## Phase 5: 문서화

- [ ] README에 --diagram 옵션 문서화
- [ ] CHANGELOG 업데이트
- [ ] 버전 0.7.0으로 업데이트
