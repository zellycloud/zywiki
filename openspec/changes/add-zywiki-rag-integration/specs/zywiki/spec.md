## ADDED Requirements

### Requirement: ZyWiki 의미 기반 검색

시스템은 자연어 쿼리로 ZyWiki 문서를 검색할 수 있어야 한다 (SHALL).
검색은 키워드 매칭이 아닌 의미 기반(semantic) 검색을 사용한다.

#### Scenario: 자연어 쿼리로 문서 검색
- **WHEN** 사용자가 "인증 관련 코드 어디 있어?"라고 검색
- **THEN** 시스템은 인증, 로그인, JWT, 세션 등 관련 문서를 유사도 순으로 반환

#### Scenario: 검색 결과 없음
- **WHEN** 관련 문서가 없는 쿼리로 검색
- **THEN** 빈 결과와 함께 적절한 메시지 반환

### Requirement: 2단계 검색 파이프라인

시스템은 임베딩 검색 후 리랭킹을 통해 정확도를 높여야 한다 (SHALL).

#### Scenario: 임베딩 + 리랭킹
- **WHEN** 검색 쿼리가 입력됨
- **THEN** 1단계로 벡터 검색으로 Top 20 후보 추출
- **AND** 2단계로 리랭커로 Top 5 최종 선정

#### Scenario: 리랭커 서버 불가 시
- **WHEN** 리랭커 서버 연결 실패
- **THEN** 1단계 벡터 검색 결과만 반환 (graceful degradation)

### Requirement: 문서 인덱싱

시스템은 ZyWiki 문서를 벡터 인덱스로 변환하여 저장할 수 있어야 한다 (SHALL).

#### Scenario: 전체 인덱싱
- **WHEN** zyflow_wiki_index Tool 호출
- **THEN** zywiki 폴더의 모든 마크다운 파일을 스캔
- **AND** 섹션(##) 단위로 분할하여 임베딩 생성
- **AND** 벡터 DB에 저장

#### Scenario: 인덱싱 진행 상황
- **WHEN** 인덱싱 완료
- **THEN** 인덱싱된 문서 수, 섹션 수, 소요 시간 반환

### Requirement: 인덱스 상태 조회

시스템은 현재 인덱스 상태를 조회할 수 있어야 한다 (SHALL).

#### Scenario: 상태 조회
- **WHEN** zyflow_wiki_status Tool 호출
- **THEN** 총 문서 수, 섹션 수, 마지막 인덱싱 시간, 인덱스 크기 반환

### Requirement: MCP Tool 제공

시스템은 Claude Code에서 사용할 수 있는 MCP Tool을 제공해야 한다 (SHALL).

#### Scenario: 검색 Tool 사용
- **WHEN** Claude Code에서 zyflow_wiki_search 호출
- **THEN** 쿼리에 대한 관련 문서 목록 반환

#### Scenario: 인덱싱 Tool 사용
- **WHEN** Claude Code에서 zyflow_wiki_index 호출
- **THEN** zywiki 문서 인덱싱 실행 및 결과 반환

### Requirement: 로컬 파일 기반 저장

시스템은 벡터 인덱스를 로컬 파일로 저장해야 한다 (SHALL).
외부 서버 없이 프로젝트 폴더 내에 저장한다.

#### Scenario: 인덱스 저장 위치
- **WHEN** 인덱싱 실행
- **THEN** .zywiki/vectors/ 폴더에 LanceDB 파일 생성

#### Scenario: 프로젝트 이동 시
- **WHEN** 프로젝트 폴더를 다른 위치로 이동
- **THEN** 벡터 인덱스도 함께 이동되어 정상 동작
