# Change: ZyWiki RAG 통합

## Why

ZyWiki 문서를 MCP 서버로 노출할 때, 단순 파일 검색(grep)만으로는 Claude Code의 기본 검색과 차별화가 없다.
의미 기반 검색(RAG)을 통해 "인증 관련 코드 어디 있어?" 같은 자연어 질문에 정확한 문서를 찾아줄 수 있어야 한다.

## What Changes

### 핵심 기능
- ZyWiki 문서를 벡터 임베딩으로 변환하여 저장
- 자연어 쿼리로 관련 문서 검색 (의미 기반)
- 리랭킹으로 검색 결과 정확도 향상
- MCP Tool로 Claude Code에서 사용 가능

### 기술 구성
- **임베딩**: z1.ism.kr:8004 (Qwen3-Embedding-0.6B)
- **리랭킹**: z1.ism.kr:8005 (BGE Reranker)
- **벡터 DB**: LanceDB (로컬 파일 기반, 설치 간편)
- **MCP Tool**: `zyflow_wiki_search`, `zyflow_wiki_index`

### 배포 옵션
1. **기본**: z1.ism.kr 서버 사용 (빠름, 무료)
2. **셀프 호스팅**: 사용자가 직접 임베딩 서버 구축
3. **로컬 폴백**: transformers.js로 브라우저/Node.js 임베딩 (느리지만 서버 불필요)

## Impact

- **Affected specs**: 신규 capability (zywiki)
- **Affected code**:
  - `mcp-server/` - 새 Tool 추가
  - `lib/rag/` - RAG 파이프라인 구현
  - `lib/embedding/` - 임베딩 클라이언트
- **Dependencies**:
  - `lancedb` - 벡터 DB
  - `@xenova/transformers` - 로컬 폴백용 (선택적)

## 사용 예시

```
사용자: "인증 관련 코드 어디 있어?"

Claude: [zyflow_wiki_search 호출]

        RAG 검색 결과:
        1. zywiki/services/authService.md (유사도 0.92)
           - JWT 토큰 생성 및 검증
           - 세션 관리 로직

        2. zywiki/middleware/authMiddleware.md (유사도 0.85)
           - 라우트 보호
           - 권한 검사

        authService.ts가 핵심 인증 로직입니다.
```

## 성공 기준

1. `zyflow_wiki_search "인증"` 호출 시 관련 문서 Top 5 반환
2. 리랭킹 적용 시 정확도 20% 이상 향상
3. 문서 100개 기준 인덱싱 10초 이내
4. 검색 응답 시간 500ms 이내
