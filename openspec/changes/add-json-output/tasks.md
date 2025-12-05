# Tasks: add-json-output

ZyWiki v0.4.0 - JSON 출력 지원

## Phase 1: 기반 작업

- [x] `src/core/output.mjs` 유틸리티 생성
  - [x] JSON/텍스트 출력 분기 함수
  - [x] 타임스탬프, 버전 필드 자동 추가
- [x] JSON 출력 스키마 TypeScript 정의 (문서용)
  - [x] `StatusOutput`, `BuildOutput`, `StackOutput`, `Manifest` 인터페이스

## Phase 2: status --json

- [x] `bin/zywiki.mjs`에 `--json` 옵션 추가
  - [x] `status` 명령에 `.option('--json', 'Output as JSON')` 추가
- [x] `src/commands/status.mjs` 리팩토링
  - [x] 결과를 객체로 수집
  - [x] `output()` 함수로 출력 분기
  - [x] `StatusOutput` 스키마 준수
- [x] status --json 테스트
  - [x] JSON 파싱 가능 확인
  - [x] 필수 필드 존재 확인

## Phase 3: build --json

- [x] `bin/zywiki.mjs`에 `--json` 옵션 추가
  - [x] `build` 명령에 옵션 추가
- [x] `src/commands/build.mjs` 리팩토링
  - [x] 빌드 결과를 배열로 수집
  - [x] 성공/실패/스킵 상태 추적
  - [x] 소요 시간 측정
  - [x] JSON 출력 시 progress spinner 비활성화
- [x] build --json 테스트
  - [x] 빌드 결과 JSON 파싱 확인
  - [x] success/error 상태 확인

## Phase 4: stack --json

- [x] `bin/zywiki.mjs`에 `--json` 옵션 추가
  - [x] `stack` 명령에 옵션 추가
- [x] `src/commands/stack.mjs` 리팩토링
  - [x] 기술 스택 정보를 객체로 반환
  - [x] `StackOutput` 스키마 준수
- [x] stack --json 테스트

## Phase 5: 매니페스트 생성

- [x] `src/core/manifest.mjs` 생성
  - [x] `generateManifest()` 함수
  - [x] 문서-소스 매핑 정보 수집
  - [x] 커버리지 계산
- [x] build 완료 시 매니페스트 자동 생성
  - [x] `.zywiki/manifest.json` 파일 생성
  - [x] 빌드 성공 시에만 업데이트
- [x] 매니페스트 테스트
  - [x] 빌드 후 파일 존재 확인
  - [x] 스키마 유효성 검증

## Phase 6: 문서화 및 릴리스

- [x] README.md 업데이트
  - [x] `--json` 옵션 문서화
  - [x] JSON 출력 예시 추가
- [x] CHANGELOG.md 업데이트
  - [x] v0.4.0 변경사항 기록
- [x] package.json 버전 업데이트
  - [x] 0.3.x → 0.4.0
- [x] npm publish: `zywiki@0.4.0`
- [x] GitHub release
- [x] Global install 업데이트
- [x] zyflow 로컬 링크 갱신
