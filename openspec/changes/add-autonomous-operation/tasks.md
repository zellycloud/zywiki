# Tasks: 자율 운영

ZyWiki v1.1.0 - 자율 운영

## Phase 1: analyze 명령어

- [ ] AnalyzeResult 타입 정의
- [ ] 복잡도 분석 모듈 구현 (lib/analyze/complexity.mjs)
- [ ] 우선순위 결정 로직 구현 (lib/analyze/priority.mjs)
- [ ] Analyzer 클래스 구현 (lib/analyze/analyzer.mjs)
- [ ] analyze 명령어 구현 (lib/commands/analyze.mjs)
- [ ] --json 출력 지원

## Phase 2: DailyBudget 관리

- [ ] DailyBudget 타입 정의
- [ ] DailyBudgetManager 클래스 구현
- [ ] 자정 리셋 로직 구현
- [ ] .zywiki/daily-budget.json 읽기/쓰기
- [ ] 예산 잔여량 조회 API

## Phase 3: watch 모드

- [ ] chokidar 의존성 추가
- [ ] FileWatcher 클래스 구현 (lib/watch/watcher.mjs)
- [ ] 디바운스 로직 구현
- [ ] 트래킹 파일 필터링
- [ ] watch 명령어 구현 (lib/commands/watch.mjs)
- [ ] --max-daily-tokens 옵션 구현
- [ ] 예산 미설정 시 경고 표시

## Phase 4: MCP 도구 통합

- [ ] zywiki_analyze 핸들러 업데이트 (v1.0.0 MCP 서버)
- [ ] 분석 결과 캐싱 (선택)

## Phase 5: 테스트

- [ ] analyze 단위 테스트
- [ ] DailyBudgetManager 테스트 (자정 리셋 포함)
- [ ] FileWatcher 테스트 (디바운스 포함)
- [ ] 예산 초과 시 빌드 중단 테스트

## Phase 6: 문서화

- [ ] README에 analyze, watch 문서화
- [ ] 비용 모니터링 가이드 작성
- [ ] CHANGELOG 업데이트
- [ ] 버전 1.1.0으로 업데이트
