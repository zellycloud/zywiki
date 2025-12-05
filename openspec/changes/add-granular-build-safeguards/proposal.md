# add-granular-build-safeguards

세분화된 빌드와 안전장치를 추가하여 비용 통제 및 안전한 자동화 기반을 마련합니다.

## 버전

v0.6.0

## 배경

현재 `zywiki build`는 전체 빌드만 지원합니다. 에이전트가 자동으로 빌드를 실행할 때 비용 폭주 위험이 있으며, 실수로 대량의 토큰을 소비할 수 있습니다.

## 목표

- 파일/디렉토리/태그 단위의 세분화된 빌드
- dry-run, 토큰 제한, 타임아웃 등 안전장치
- 프로그래밍적 오류 판단을 위한 종료 코드 체계

## 범위

### 포함

- 범위 지정 옵션: `--file`, `--path`, `--stale-only`, `--filter`
- 안전장치: `--dry-run`, `--max-tokens`, `--max-files`, `--timeout`
- 종료 코드 체계화 (0-5)
- JSON 출력에 예산 정보 포함

### 제외

- 실시간 토큰 사용량 모니터링 (v1.1.0 watch 모드에서)
- 과금 경고 알림

## 성공 기준

1. `zywiki build --file src/auth.ts`로 단일 파일만 빌드
2. `zywiki build --dry-run`으로 실제 빌드 없이 미리보기
3. `zywiki build --max-tokens 10000`으로 예산 초과 시 중단
4. 종료 코드로 오류 유형 구분 가능

## 의존성

- v0.4.0 (JSON 출력)
- v0.5.0 (schema 명령어와 유사한 패턴)
