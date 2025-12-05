# add-er-diagram

스키마 문서화에 ER 다이어그램 자동 생성 기능을 추가합니다.

## 버전

v0.7.0

## 배경

v0.5.0에서 SQL 스키마 문서화가 추가되었지만, 테이블 간 관계를 시각적으로 파악하기 어렵습니다. ER 다이어그램은 DB 구조를 한눈에 이해할 수 있게 해줍니다.

## 목표

- Mermaid ER 다이어그램 자동 생성
- 마크다운 문서에 다이어그램 포함
- 관계 유형 (1:1, 1:N, N:M) 시각화

## 범위

### 포함

- `zywiki schema --diagram` 옵션
- Mermaid erDiagram 문법 출력
- 테이블 관계 시각화
- zywiki/database/overview.md에 전체 ER 다이어그램 포함

### 제외

- SVG/PNG 이미지 직접 생성 (Mermaid 렌더링은 뷰어에서)
- 대화형 다이어그램

## 성공 기준

1. `zywiki schema --diagram`으로 Mermaid 코드 출력
2. 모든 테이블과 관계가 다이어그램에 표시
3. 마크다운 파일에 ```mermaid 블록으로 삽입

## 의존성

- v0.5.0 (SQL 스키마 문서화, UnifiedSchema)
