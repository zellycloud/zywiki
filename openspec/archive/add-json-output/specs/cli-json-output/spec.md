# CLI JSON Output

## ADDED Requirements

### Requirement: JSON output for status command

`zywiki status --json` 명령은 구조화된 JSON 형식으로 상태 정보를 출력해야 합니다. 시스템은 유효한 JSON을 stdout으로 출력해야 합니다(MUST).

#### Scenario: status --json outputs valid JSON

**Given** zywiki가 초기화된 프로젝트
**When** `zywiki status --json` 실행
**Then** 유효한 JSON이 stdout으로 출력됨
**And** JSON에 `version`, `timestamp`, `stats` 필드가 포함됨
**And** `stats`에 `tracked`, `documented`, `pending`, `coverage` 필드가 포함됨

#### Scenario: status without --json outputs text

**Given** zywiki가 초기화된 프로젝트
**When** `zywiki status` 실행 (--json 없이)
**Then** 기존 텍스트 형식으로 출력됨

---

### Requirement: JSON output for build command

`zywiki build --json` 명령은 빌드 결과를 구조화된 JSON 형식으로 출력해야 합니다(MUST). progress spinner는 JSON 모드에서 비활성화되어야 합니다(SHALL).

#### Scenario: build --json outputs build results

**Given** zywiki가 초기화되고 소스 파일이 트래킹된 프로젝트
**When** `zywiki build --json` 실행
**Then** 유효한 JSON이 stdout으로 출력됨
**And** JSON에 `success`, `stats`, `results` 필드가 포함됨
**And** `results`는 각 문서의 생성 상태를 포함하는 배열

#### Scenario: build --json suppresses progress spinner

**Given** zywiki가 초기화된 프로젝트
**When** `zywiki build --json` 실행
**Then** progress spinner가 출력되지 않음
**And** 순수 JSON만 출력됨

---

### Requirement: JSON output for stack command

`zywiki stack --json` 명령은 기술 스택 정보를 구조화된 JSON 형식으로 출력해야 합니다(MUST).

#### Scenario: stack --json outputs tech stack info

**Given** zywiki가 초기화된 프로젝트
**When** `zywiki stack --json` 실행
**Then** 유효한 JSON이 stdout으로 출력됨
**And** JSON에 `languages`, `frameworks`, `services`, `summary` 필드가 포함됨

---

### Requirement: Manifest file generation

빌드 완료 시 시스템은 `.zywiki/manifest.json` 파일을 자동 생성해야 합니다(MUST). 매니페스트는 코드-문서 매핑 정보를 포함해야 합니다(SHALL).

#### Scenario: build generates manifest.json

**Given** zywiki가 초기화된 프로젝트
**When** `zywiki build` 실행하여 문서 생성 성공
**Then** `.zywiki/manifest.json` 파일이 생성됨
**And** 파일에 `generatedAt`, `documents`, `codeToDocMap`, `coverage` 필드가 포함됨

#### Scenario: manifest includes code-to-doc mapping

**Given** `src/auth.ts` 파일이 트래킹되고 `zywiki/features/auth.md`로 문서화됨
**When** `zywiki build` 실행 완료
**Then** `manifest.json`의 `codeToDocMap`에 `"src/auth.ts": "zywiki/features/auth.md"` 매핑이 포함됨

#### Scenario: manifest updates on rebuild

**Given** 이전 빌드로 `manifest.json`이 존재
**When** `zywiki build --force` 실행
**Then** `manifest.json`의 `generatedAt`이 현재 시간으로 업데이트됨

---

### Requirement: JSON schema versioning

모든 JSON 출력에는 스키마 버전이 포함되어야 합니다(MUST). 이를 통해 향후 스키마 변경 시 하위 호환성을 관리할 수 있어야 합니다(SHALL).

#### Scenario: JSON output includes version field

**Given** 임의의 zywiki 명령
**When** `--json` 플래그와 함께 실행
**Then** 출력 JSON의 최상위에 `version` 필드가 존재
**And** 버전 형식은 `"1.0"` 같은 문자열
