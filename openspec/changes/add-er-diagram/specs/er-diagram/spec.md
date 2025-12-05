# ER Diagram

## ADDED Requirements

### Requirement: Generate Mermaid ER diagram

시스템은 UnifiedSchema로부터 Mermaid erDiagram 코드를 생성해야 합니다(MUST).

#### Scenario: Generate ER diagram with relations

**Given** users와 posts 테이블이 1:N 관계
**When** `zywiki schema --diagram` 실행
**Then** Mermaid erDiagram 코드 출력됨
**And** users ||--o{ posts 관계 포함됨

#### Scenario: Generate ER diagram without relations

**Given** 관계가 없는 독립 테이블
**When** `zywiki schema --diagram` 실행
**Then** 테이블 블록은 출력됨
**And** 관계선 없음

---

### Requirement: Visualize relation types

시스템은 모든 관계 유형을 올바른 Mermaid 기호로 표현해야 합니다(MUST).

#### Scenario: Visualize one-to-one relation

**Given** users와 profiles가 1:1 관계
**When** 다이어그램 생성
**Then** ||--|| 기호 사용됨

#### Scenario: Visualize one-to-many relation

**Given** users와 posts가 1:N 관계
**When** 다이어그램 생성
**Then** ||--o{ 기호 사용됨

#### Scenario: Visualize many-to-many relation

**Given** posts와 tags가 N:M 관계
**When** 다이어그램 생성
**Then** }o--o{ 기호 사용됨

---

### Requirement: Include table columns in diagram

시스템은 다이어그램에 테이블 컬럼 정보를 포함해야 합니다(SHALL).

#### Scenario: Show columns with types

**Given** users 테이블에 id, email, created_at 컬럼
**When** `zywiki schema --diagram` 실행
**Then** users 블록에 컬럼 목록 포함됨
**And** 타입 정보 포함됨

#### Scenario: Show PK and FK markers

**Given** id가 PK이고 user_id가 FK인 테이블
**When** 다이어그램 생성
**Then** PK, FK 표시 포함됨

---

### Requirement: Generate overview.md with diagram

시스템은 zywiki/database/overview.md에 ER 다이어그램을 포함해야 합니다(SHALL).

#### Scenario: Create overview.md with ER diagram

**Given** 스키마 문서화 실행
**When** `zywiki schema --output zywiki/database/` 실행
**Then** zywiki/database/overview.md 생성됨
**And** \`\`\`mermaid 블록에 ER 다이어그램 포함됨

#### Scenario: Include table summary in overview

**Given** overview.md 생성
**When** 파일 내용 확인
**Then** 테이블 요약 테이블 포함됨

#### Scenario: Update existing overview.md

**Given** 이미 overview.md 존재
**When** 스키마 재생성
**Then** overview.md 업데이트됨

---

### Requirement: JSON output with diagram field

시스템은 --json과 --diagram 함께 사용 시 diagram 필드를 포함해야 합니다(MUST).

#### Scenario: JSON includes diagram.mermaid

**Given** --json과 --diagram 함께 사용
**When** `zywiki schema --json --diagram` 실행
**Then** JSON에 diagram.mermaid 필드 포함됨
**And** diagram.relationCount 포함됨

#### Scenario: JSON without diagram field

**Given** --json만 사용 (--diagram 없음)
**When** `zywiki schema --json` 실행
**Then** diagram 필드 없음
