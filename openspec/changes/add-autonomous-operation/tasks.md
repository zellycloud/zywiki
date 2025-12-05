# Tasks: 자율 운영

## Group 1: analyze 명령어

- [ ] task-1-1: AnalyzeResult 타입 정의
- [ ] task-1-2: 복잡도 분석 모듈 구현 (lib/analyze/complexity.mjs)
- [ ] task-1-3: 우선순위 결정 로직 구현 (lib/analyze/priority.mjs)
- [ ] task-1-4: Analyzer 클래스 구현 (lib/analyze/analyzer.mjs)
- [ ] task-1-5: analyze 명령어 구현 (lib/commands/analyze.mjs)
- [ ] task-1-6: --json 출력 지원

## Group 2: DailyBudget 관리

- [ ] task-2-1: DailyBudget 타입 정의
- [ ] task-2-2: DailyBudgetManager 클래스 구현
- [ ] task-2-3: 자정 리셋 로직 구현
- [ ] task-2-4: .zywiki/daily-budget.json 읽기/쓰기
- [ ] task-2-5: 예산 잔여량 조회 API

## Group 3: watch 모드

- [ ] task-3-1: chokidar 의존성 추가
- [ ] task-3-2: FileWatcher 클래스 구현 (lib/watch/watcher.mjs)
- [ ] task-3-3: 디바운스 로직 구현
- [ ] task-3-4: 트래킹 파일 필터링
- [ ] task-3-5: watch 명령어 구현 (lib/commands/watch.mjs)
- [ ] task-3-6: --max-daily-tokens 옵션 구현
- [ ] task-3-7: 예산 미설정 시 경고 표시

## Group 4: MCP 도구 통합

- [ ] task-4-1: zywiki_analyze 핸들러 업데이트 (v1.0.0 MCP 서버)
- [ ] task-4-2: 분석 결과 캐싱 (선택)

## Group 5: 테스트

- [ ] task-5-1: analyze 단위 테스트
- [ ] task-5-2: DailyBudgetManager 테스트 (자정 리셋 포함)
- [ ] task-5-3: FileWatcher 테스트 (디바운스 포함)
- [ ] task-5-4: 예산 초과 시 빌드 중단 테스트

## Group 6: 문서화

- [ ] task-6-1: README에 analyze, watch 문서화
- [ ] task-6-2: 비용 모니터링 가이드 작성
- [ ] task-6-3: CHANGELOG 업데이트
- [ ] task-6-4: 버전 1.1.0으로 업데이트
