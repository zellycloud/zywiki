# Design: MCP 서버

## 아키텍처

```
┌─────────────────────────────────────────────────────────┐
│                    Claude Code / Cursor                 │
│                    (MCP Client)                         │
└──────────────────────┬──────────────────────────────────┘
                       │ stdio / HTTP
                       │
┌──────────────────────▼──────────────────────────────────┐
│                    ZyWiki MCP Server                    │
├─────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │
│  │ zywiki_     │  │ zywiki_     │  │ zywiki_     │     │
│  │ status      │  │ search      │  │ build       │     │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘     │
│         │                │                │             │
│  ┌─────────────┐  ┌─────────────┐                      │
│  │ zywiki_     │  │ zywiki_     │                      │
│  │ schema      │  │ analyze     │                      │
│  └──────┬──────┘  └──────┬──────┘                      │
│         └────────────────┼──────────────────┘          │
│                          │                              │
│              ┌───────────▼───────────┐                 │
│              │   Core Library        │                 │
│              │   (lib/*.mjs)         │                 │
│              └───────────────────────┘                 │
└─────────────────────────────────────────────────────────┘
```

## MCP 도구 정의

### zywiki_status

```typescript
{
  name: 'zywiki_status',
  description: '프로젝트의 문서화 상태를 조회합니다',
  inputSchema: {
    type: 'object',
    properties: {
      file: {
        type: 'string',
        description: '특정 파일 상태 조회 (선택)'
      },
      projectPath: {
        type: 'string',
        description: '프로젝트 경로 (기본: 현재 디렉토리)'
      }
    }
  }
}
```

응답:
```json
{
  "tracked": 45,
  "documented": 38,
  "stale": 5,
  "coverage": 84.4,
  "files": [
    {
      "file": "src/auth.ts",
      "documented": true,
      "docPath": "zywiki/security/auth.md",
      "freshness": "stale",
      "staleDays": 5
    }
  ]
}
```

### zywiki_search

```typescript
{
  name: 'zywiki_search',
  description: '문서를 RAG 기반으로 검색합니다',
  inputSchema: {
    type: 'object',
    properties: {
      query: {
        type: 'string',
        description: '검색 쿼리'
      },
      limit: {
        type: 'number',
        description: '최대 결과 수 (기본: 5)'
      },
      projectPath: {
        type: 'string',
        description: '프로젝트 경로'
      }
    },
    required: ['query']
  }
}
```

### zywiki_build

```typescript
{
  name: 'zywiki_build',
  description: '문서를 빌드합니다 (안전장치 포함)',
  inputSchema: {
    type: 'object',
    properties: {
      file: { type: 'string', description: '단일 파일 빌드' },
      path: { type: 'string', description: '디렉토리 빌드' },
      staleOnly: { type: 'boolean', description: '오래된 것만' },
      dryRun: { type: 'boolean', description: '미리보기만' },
      maxTokens: { type: 'number', description: '토큰 예산' },
      maxFiles: { type: 'number', description: '파일 수 제한' },
      timeout: { type: 'number', description: '타임아웃 (초)' },
      projectPath: { type: 'string' }
    }
  }
}
```

### zywiki_schema

```typescript
{
  name: 'zywiki_schema',
  description: '데이터베이스 스키마를 조회합니다',
  inputSchema: {
    type: 'object',
    properties: {
      auto: { type: 'boolean', description: '자동 감지' },
      prisma: { type: 'string', description: 'Prisma 스키마 경로' },
      drizzle: { type: 'string', description: 'Drizzle 스키마 경로' },
      sql: { type: 'string', description: 'SQL 파일 패턴' },
      db: { type: 'string', description: 'DB 연결 문자열' },
      diagram: { type: 'boolean', description: 'ER 다이어그램 포함' },
      projectPath: { type: 'string' }
    }
  }
}
```

### zywiki_analyze

```typescript
{
  name: 'zywiki_analyze',
  description: '문서화 필요성을 분석합니다',
  inputSchema: {
    type: 'object',
    properties: {
      projectPath: { type: 'string' }
    }
  }
}
```

응답:
```json
{
  "urgent": [
    { "file": "src/payment.ts", "reason": "복잡도 높음, 문서 없음", "priority": 1 }
  ],
  "stale": [
    { "file": "src/auth.ts", "staleDays": 14, "priority": 2 }
  ],
  "suggestions": [
    "src/api/ 디렉토리 문서화 권장 (0% 커버리지)"
  ]
}
```

## 구현

### 서버 진입점

```typescript
// mcp-server/index.ts
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

const server = new Server({
  name: 'zywiki-mcp',
  version: '1.0.0'
}, {
  capabilities: {
    tools: {}
  }
});

// 도구 등록
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    statusTool,
    searchTool,
    buildTool,
    schemaTool,
    analyzeTool
  ]
}));

// 도구 실행
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  switch (name) {
    case 'zywiki_status':
      return handleStatus(args);
    case 'zywiki_search':
      return handleSearch(args);
    case 'zywiki_build':
      return handleBuild(args);
    case 'zywiki_schema':
      return handleSchema(args);
    case 'zywiki_analyze':
      return handleAnalyze(args);
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
});

// 시작
const transport = new StdioServerTransport();
await server.connect(transport);
```

### 핸들러 예시

```typescript
// mcp-server/handlers/status.ts
import { getStatus } from '../../lib/status.mjs';

export async function handleStatus(args: any) {
  const { file, projectPath = process.cwd() } = args;

  const result = await getStatus(projectPath, { file, json: true });

  return {
    content: [{
      type: 'text',
      text: JSON.stringify(result, null, 2)
    }]
  };
}
```

## 설정 (Claude Code)

```json
// ~/.claude/claude_desktop_config.json
{
  "mcpServers": {
    "zywiki": {
      "command": "npx",
      "args": ["zywiki-mcp"],
      "env": {
        "ANTHROPIC_API_KEY": "..."
      }
    }
  }
}
```

## 파일 구조

```
mcp-server/
├── index.ts              # 진입점
├── tools.ts              # 도구 정의
└── handlers/
    ├── status.ts
    ├── search.ts
    ├── build.ts
    ├── schema.ts
    └── analyze.ts

package.json              # bin: { "zywiki-mcp": "..." }
```

## 에러 처리

```typescript
interface McpError {
  code: string;
  message: string;
  details?: any;
}

// 에러 응답 형식
{
  content: [{
    type: 'text',
    text: JSON.stringify({
      error: {
        code: 'BUDGET_EXCEEDED',
        message: '토큰 예산 초과',
        details: { used: 50000, limit: 10000 }
      }
    })
  }],
  isError: true
}
```
