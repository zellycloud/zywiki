# Tasks: 세분화 빌드 + 안전장치

## Group 1: 기반 구조

- [ ] task-1-1: 종료 코드 상수 정의 (lib/constants/exit-codes.mjs)
- [ ] task-1-2: BuildOptions 타입 정의
- [ ] task-1-3: BuildResult 타입 정의

## Group 2: 필터 파이프라인

- [ ] task-2-1: --file 옵션 구현 (단일 파일 필터)
- [ ] task-2-2: --path 옵션 구현 (디렉토리 필터)
- [ ] task-2-3: --stale-only 옵션 구현 (오래된 문서만)
- [ ] task-2-4: --filter 옵션 구현 (태그 필터)
- [ ] task-2-5: 필터 파이프라인 통합 (lib/build/filter.mjs)

## Group 3: 안전장치

- [ ] task-3-1: --max-files 옵션 구현
- [ ] task-3-2: --max-tokens 옵션 구현
- [ ] task-3-3: --timeout 옵션 구현
- [ ] task-3-4: BudgetManager 클래스 구현 (lib/build/budget.mjs)
- [ ] task-3-5: 예산 초과 시 종료 코드 반환

## Group 4: dry-run

- [ ] task-4-1: --dry-run 옵션 구현
- [ ] task-4-2: dry-run 결과 출력 (wouldProcess, wouldSkip)
- [ ] task-4-3: 예상 토큰/비용 계산

## Group 5: 통합 및 테스트

- [ ] task-5-1: build 명령어에 모든 옵션 통합
- [ ] task-5-2: JSON 출력에 예산 정보 포함
- [ ] task-5-3: 종료 코드 테스트
- [ ] task-5-4: 필터 조합 테스트

## Group 6: 문서화

- [ ] task-6-1: README에 새 옵션 문서화
- [ ] task-6-2: CHANGELOG 업데이트
- [ ] task-6-3: 버전 0.6.0으로 업데이트
