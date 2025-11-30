# ZyWiki RAG 태스크

## 1. 프로젝트 설정

- [ ] 1.1 lancedb 패키지 설치
- [ ] 1.2 lib/rag, lib/embedding, lib/vectordb 디렉토리 구조 생성
- [ ] 1.3 환경 변수 설정 (EMBEDDING_URL, RERANKER_URL)

## 2. 임베딩 클라이언트 구현

- [ ] 2.1 lib/embedding/client.ts 생성 (z1 서버 연동)
- [ ] 2.2 배치 임베딩 지원 (여러 텍스트 한번에)
- [ ] 2.3 에러 핸들링 및 재시도 로직
- [ ] 2.4 연결 테스트 함수

## 3. 벡터 DB 구현

- [ ] 3.1 lib/vectordb/lancedb.ts 생성
- [ ] 3.2 테이블 스키마 정의 (file_path, section, content, vector)
- [ ] 3.3 upsert 함수 (인덱싱용)
- [ ] 3.4 search 함수 (벡터 검색)
- [ ] 3.5 인덱스 상태 조회 함수

## 4. RAG 파이프라인 구현

- [ ] 4.1 lib/rag/indexer.ts - 문서 인덱싱
- [ ] 4.2 zywiki 폴더 스캔
- [ ] 4.3 마크다운 파싱 및 섹션 분할
- [ ] 4.4 임베딩 생성 및 저장
- [ ] 4.5 lib/rag/searcher.ts - 검색
- [ ] 4.6 쿼리 임베딩 생성
- [ ] 4.7 벡터 검색 (Top 20)
- [ ] 4.8 리랭킹 (Top 5)
- [ ] 4.9 lib/rag/index.ts - 통합 인터페이스

## 5. 리랭커 클라이언트 구현

- [ ] 5.1 lib/rag/reranker.ts 생성 (z1:8005 연동)
- [ ] 5.2 배치 리랭킹 지원
- [ ] 5.3 점수 정규화

## 6. MCP Tool 추가

- [ ] 6.1 mcp-server/wiki-tools.ts 생성
- [ ] 6.2 zyflow_wiki_search 구현
- [ ] 6.3 zyflow_wiki_index 구현
- [ ] 6.4 zyflow_wiki_status 구현
- [ ] 6.5 mcp-server/tools.ts에 등록

## 7. 빌드 및 테스트

- [ ] 7.1 TypeScript 빌드 확인
- [ ] 7.2 인덱싱 테스트 (실제 zywiki 폴더)
- [ ] 7.3 검색 테스트 (정확도 확인)
- [ ] 7.4 MCP Tool 통합 테스트

## 8. 문서화

- [ ] 8.1 README에 ZyWiki RAG 섹션 추가
- [ ] 8.2 환경 변수 설정 가이드
- [ ] 8.3 사용 예시 추가
