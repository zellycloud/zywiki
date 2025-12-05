# Tasks: add-json-output

## Overview

ZyWiki v0.4.0 - JSON 출력 지원

## Task Groups

### Group 1: 기반 작업

- [ ] 1-1. `src/core/output.mjs` 유틸리티 생성
  - JSON/텍스트 출력 분기 함수
  - 타임스탬프, 버전 필드 자동 추가

- [ ] 1-2. JSON 출력 스키마 TypeScript 정의 (문서용)
  - `StatusOutput`, `BuildOutput`, `StackOutput`, `Manifest` 인터페이스

### Group 2: status --json

- [ ] 2-1. `bin/zywiki.mjs`에 `--json` 옵션 추가
  - `status` 명령에 `.option('--json', 'Output as JSON')` 추가

- [ ] 2-2. `src/commands/status.mjs` 리팩토링
  - 결과를 객체로 수집
  - `output()` 함수로 출력 분기
  - `StatusOutput` 스키마 준수

- [ ] 2-3. status --json 테스트
  - JSON 파싱 가능 확인
  - 필수 필드 존재 확인

### Group 3: build --json

- [ ] 3-1. `bin/zywiki.mjs`에 `--json` 옵션 추가
  - `build` 명령에 옵션 추가

- [ ] 3-2. `src/commands/build.mjs` 리팩토링
  - 빌드 결과를 배열로 수집
  - 성공/실패/스킵 상태 추적
  - 소요 시간 측정
  - JSON 출력 시 progress spinner 비활성화

- [ ] 3-3. build --json 테스트
  - 빌드 결과 JSON 파싱 확인
  - success/error 상태 확인

### Group 4: stack --json

- [ ] 4-1. `bin/zywiki.mjs`에 `--json` 옵션 추가
  - `stack` 명령에 옵션 추가

- [ ] 4-2. `src/commands/stack.mjs` 리팩토링
  - 기술 스택 정보를 객체로 반환
  - `StackOutput` 스키마 준수

- [ ] 4-3. stack --json 테스트

### Group 5: 매니페스트 생성

- [ ] 5-1. `src/core/manifest.mjs` 생성
  - `generateManifest()` 함수
  - 문서-소스 매핑 정보 수집
  - 커버리지 계산

- [ ] 5-2. build 완료 시 매니페스트 자동 생성
  - `.zywiki/manifest.json` 파일 생성
  - 빌드 성공 시에만 업데이트

- [ ] 5-3. 매니페스트 테스트
  - 빌드 후 파일 존재 확인
  - 스키마 유효성 검증

### Group 6: 문서화 및 릴리스

- [ ] 6-1. README.md 업데이트
  - `--json` 옵션 문서화
  - JSON 출력 예시 추가

- [ ] 6-2. CHANGELOG.md 업데이트
  - v0.4.0 변경사항 기록

- [ ] 6-3. package.json 버전 업데이트
  - 0.3.x → 0.4.0

## Dependencies

```
Group 1 (기반) → Group 2, 3, 4, 5 (병렬 가능)
Group 2-5 완료 → Group 6 (문서화)
```

## Validation

각 그룹 완료 시:
1. `npm run lint` 통과
2. 해당 명령어 `--json` 실행하여 유효한 JSON 출력 확인
3. 기존 텍스트 출력 동작 유지 확인
