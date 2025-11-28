# ZyWiki RAG 태스크

## 1. 프로젝트 설정

- [ ] lancedb 패키지 설치
- [ ] lib/rag, lib/embedding, lib/vectordb 디렉토리 구조 생성
- [ ] 환경 변수 설정 (EMBEDDING_URL, RERANKER_URL)

## 2. 임베딩 클라이언트 구현

- [ ] lib/embedding/client.ts 생성 (z1 서버 연동)
- [ ] 배치 임베딩 지원 (여러 텍스트 한번에)
- [ ] 에러 핸들링 및 재시도 로직
- [ ] 연결 테스트 함수

## 3. 벡터 DB 구현

- [ ] lib/vectordb/lancedb.ts 생성
- [ ] 테이블 스키마 정의 (file_path, section, content, vector)
- [ ] upsert 함수 (인덱싱용)
- [ ] search 함수 (벡터 검색)
- [ ] 인덱스 상태 조회 함수

## 4. RAG 파이프라인 구현

- [ ] lib/rag/indexer.ts - 문서 인덱싱
  - [ ] zywiki 폴더 스캔
  - [ ] 마크다운 파싱 및 섹션 분할
  - [ ] 임베딩 생성 및 저장
- [ ] lib/rag/searcher.ts - 검색
  - [ ] 쿼리 임베딩 생성
  - [ ] 벡터 검색 (Top 20)
  - [ ] 리랭킹 (Top 5)
- [ ] lib/rag/index.ts - 통합 인터페이스

## 5. 리랭커 클라이언트 구현

- [ ] lib/rag/reranker.ts 생성 (z1:8005 연동)
- [ ] 배치 리랭킹 지원
- [ ] 점수 정규화

## 6. MCP Tool 추가

- [ ] mcp-server/wiki-tools.ts 생성
- [ ] zyflow_wiki_search 구현
- [ ] zyflow_wiki_index 구현
- [ ] zyflow_wiki_status 구현
- [ ] mcp-server/tools.ts에 등록

## 7. 빌드 및 테스트

- [ ] TypeScript 빌드 확인
- [ ] 인덱싱 테스트 (실제 zywiki 폴더)
- [ ] 검색 테스트 (정확도 확인)
- [ ] MCP Tool 통합 테스트

## 8. 문서화

- [ ] README에 ZyWiki RAG 섹션 추가
- [ ] 환경 변수 설정 가이드
- [ ] 사용 예시 추가
