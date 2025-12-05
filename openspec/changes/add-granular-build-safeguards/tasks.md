# Tasks: 세분화 빌드 + 안전장치

ZyWiki v0.6.0 - 세분화 빌드 + 안전장치

## Phase 1: 기반 구조

- [ ] 종료 코드 상수 정의 (lib/constants/exit-codes.mjs)
- [ ] BuildOptions 타입 정의
- [ ] BuildResult 타입 정의

## Phase 2: 필터 파이프라인

- [ ] --file 옵션 구현 (단일 파일 필터)
- [ ] --path 옵션 구현 (디렉토리 필터)
- [ ] --stale-only 옵션 구현 (오래된 문서만)
- [ ] --filter 옵션 구현 (태그 필터)
- [ ] 필터 파이프라인 통합 (lib/build/filter.mjs)

## Phase 3: 안전장치

- [ ] --max-files 옵션 구현
- [ ] --max-tokens 옵션 구현
- [ ] --timeout 옵션 구현
- [ ] BudgetManager 클래스 구현 (lib/build/budget.mjs)
- [ ] 예산 초과 시 종료 코드 반환

## Phase 4: dry-run

- [ ] --dry-run 옵션 구현
- [ ] dry-run 결과 출력 (wouldProcess, wouldSkip)
- [ ] 예상 토큰/비용 계산

## Phase 5: 통합 및 테스트

- [ ] build 명령어에 모든 옵션 통합
- [ ] JSON 출력에 예산 정보 포함
- [ ] 종료 코드 테스트
- [ ] 필터 조합 테스트

## Phase 6: 문서화

- [ ] README에 새 옵션 문서화
- [ ] CHANGELOG 업데이트
- [ ] 버전 0.6.0으로 업데이트
