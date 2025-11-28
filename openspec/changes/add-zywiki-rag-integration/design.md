# ZyWiki RAG 설계

## Context

ZyWiki는 코드베이스 문서를 마크다운으로 생성/관리하는 도구.
현재는 파일 기반 검색만 가능하여 Claude Code의 기본 grep과 차별화가 없음.
RAG를 통해 의미 기반 검색을 제공하면 MCP Tool로서 가치가 생김.

### 기존 인프라
- z1.ism.kr:8004 - Qwen3-Embedding-0.6B (llama.cpp)
- z1.ism.kr:8005 - BGE Reranker (HuggingFace TEI)

## Goals / Non-Goals

### Goals
- 자연어 쿼리로 관련 ZyWiki 문서 검색
- 2단계 검색 (임베딩 → 리랭킹)으로 정확도 향상
- MCP Tool로 Claude Code에서 사용 가능
- 로컬 파일 기반 벡터 DB (서버 불필요)

### Non-Goals
- 실시간 문서 동기화 (수동 인덱싱으로 시작)
- 웹 UI (MCP Tool 우선)
- 다중 프로젝트 지원 (단일 프로젝트 우선)

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  Claude Code                                                │
│  "인증 관련 코드 어디 있어?"                                  │
└──────────────┬──────────────────────────────────────────────┘
               │ MCP Tool 호출
               ▼
┌──────────────────────────────────────────────────────────────┐
│  ZyFlow MCP Server                                           │
│  ├─ zyflow_wiki_search(query)                                │
│  └─ zyflow_wiki_index()                                      │
└──────────────┬───────────────────────────────────────────────┘
               │
               ▼
┌──────────────────────────────────────────────────────────────┐
│  RAG Pipeline (lib/rag/)                                     │
│                                                              │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐      │
│  │ 1. Embed    │ →  │ 2. Search   │ →  │ 3. Rerank   │      │
│  │ Query       │    │ LanceDB    │    │ Top K       │      │
│  └──────┬──────┘    └──────┬──────┘    └──────┬──────┘      │
│         │                  │                  │              │
│         ▼                  ▼                  ▼              │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐      │
│  │ z1:8004     │    │ .zyflow/    │    │ z1:8005     │      │
│  │ Embedding   │    │ vectors.db  │    │ Reranker    │      │
│  └─────────────┘    └─────────────┘    └─────────────┘      │
└──────────────────────────────────────────────────────────────┘
```

## Decisions

### 1. 벡터 DB: LanceDB
- **결정**: LanceDB 사용
- **이유**:
  - npm install 하나로 설치
  - 파일 기반 (SQLite처럼)
  - 서버 불필요
  - TypeScript 지원
- **대안**:
  - Supabase pgvector - 서버 필요, 설정 복잡
  - Chroma - Python 의존성
  - Pinecone - 클라우드 서비스, 비용

### 2. 임베딩 서버: z1.ism.kr (기본)
- **결정**: 기존 z1 서버 활용
- **이유**:
  - 이미 구축됨
  - 무료
  - 성능 검증됨 (Qwen3-Embedding)
- **폴백**: transformers.js (로컬)

### 3. 청킹 전략: 섹션 기반
- **결정**: 마크다운 섹션(##) 단위로 분할
- **이유**:
  - ZyWiki 문서가 이미 구조화됨
  - 섹션별 임베딩이 의미 단위와 일치
  - 검색 결과가 바로 활용 가능
- **대안**:
  - 고정 크기 (500자) - 문맥 손실
  - 전체 문서 - 임베딩 품질 저하

### 4. 인덱싱: 수동 트리거
- **결정**: `zyflow_wiki_index` Tool로 수동 실행
- **이유**:
  - 단순함
  - 문서 변경이 빈번하지 않음
  - 파일 워치 구현 복잡도 회피
- **향후**: 파일 변경 감지 자동 인덱싱

## Data Flow

### 인덱싱 (문서 → 벡터)

```
1. zywiki/*.md 파일 스캔
2. 마크다운 파싱 → 섹션별 분할
3. 각 섹션 → z1:8004 임베딩 요청
4. 벡터 + 메타데이터 → LanceDB 저장

메타데이터:
{
  file_path: "zywiki/services/authService.md",
  section: "## JWT 토큰 생성",
  content: "...",
  vector: [0.1, 0.2, ...]
}
```

### 검색 (쿼리 → 결과)

```
1. 쿼리 → z1:8004 임베딩
2. LanceDB 벡터 검색 → Top 20
3. Top 20 → z1:8005 리랭킹 → Top 5
4. 결과 반환 (파일 경로, 섹션, 유사도)
```

## File Structure

```
/Users/hansoo./ZELLYY/zyflow/
├── lib/
│   ├── rag/
│   │   ├── index.ts        # RAG 파이프라인
│   │   ├── indexer.ts      # 문서 인덱싱
│   │   └── searcher.ts     # 벡터 검색
│   ├── embedding/
│   │   ├── client.ts       # 임베딩 API 클라이언트
│   │   └── local.ts        # 로컬 폴백 (선택적)
│   └── vectordb/
│       └── lancedb.ts      # LanceDB 래퍼
├── mcp-server/
│   ├── tools.ts            # + wiki 도구 추가
│   └── wiki-tools.ts       # Wiki 전용 도구
└── .zyflow/
    └── vectors/            # LanceDB 데이터 (프로젝트별)
```

## API Design

### MCP Tools

```typescript
// 문서 검색
zyflow_wiki_search: {
  input: {
    query: string,           // 검색 쿼리
    limit?: number,          // 결과 수 (기본 5)
    threshold?: number       // 유사도 임계값 (기본 0.5)
  },
  output: {
    results: [{
      file_path: string,
      section: string,
      content: string,
      similarity: number
    }]
  }
}

// 인덱스 갱신
zyflow_wiki_index: {
  input: {
    path?: string            // zywiki 경로 (기본: ./zywiki)
  },
  output: {
    indexed: number,         // 인덱싱된 섹션 수
    duration_ms: number
  }
}

// 인덱스 상태
zyflow_wiki_status: {
  input: {},
  output: {
    total_documents: number,
    total_sections: number,
    last_indexed: string,    // ISO timestamp
    index_size_mb: number
  }
}
```

### Embedding API (z1.ism.kr:8004)

```typescript
// llama.cpp /embedding 엔드포인트
POST http://z1.ism.kr:8004/embedding
{
  "content": "검색할 텍스트"
}
// Response: { "embedding": [0.1, 0.2, ...] }
```

### Reranker API (z1.ism.kr:8005)

```typescript
// HuggingFace TEI /rerank 엔드포인트
POST http://z1.ism.kr:8005/rerank
{
  "query": "검색 쿼리",
  "texts": ["문서1", "문서2", ...],
  "truncate": true
}
// Response: [{ "index": 0, "score": 0.95 }, ...]
```

## Risks / Trade-offs

### 1. z1 서버 의존성
- **리스크**: 서버 다운 시 RAG 불가
- **완화**: 로컬 폴백 옵션 (transformers.js)
- **수용**: 개인 프로젝트이므로 수용 가능

### 2. 임베딩 품질
- **리스크**: Qwen3-0.6B가 한국어 성능 미검증
- **완화**: BGE Reranker로 보완
- **수용**: 테스트 후 모델 교체 가능

### 3. 벡터 DB 크기
- **리스크**: 문서 많아지면 인덱스 커짐
- **완화**: LanceDB 압축, 필요시 샤딩
- **예상**: 1000 섹션 ≈ 50MB (수용 가능)

## Open Questions

1. **청킹 크기**: 섹션이 너무 길면 분할? (500자 제한?)
2. **캐싱**: 쿼리 임베딩 캐시 필요?
3. **증분 인덱싱**: 변경된 파일만 재인덱싱?

## References

- LanceDB: https://lancedb.github.io/lancedb/
- Qwen Embedding: https://huggingface.co/Qwen
- BGE Reranker: https://huggingface.co/BAAI/bge-reranker-base
