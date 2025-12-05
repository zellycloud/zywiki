# Design: SQL 스키마 문서화

## 아키텍처

```
┌─────────────────────────────────────────────────────────┐
│                    schema 명령어                         │
├─────────────────────────────────────────────────────────┤
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐ │
│  │ Prisma   │  │ Drizzle  │  │ SQL      │  │ DB      │ │
│  │ Parser   │  │ Parser   │  │ Parser   │  │ Intro   │ │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬────┘ │
│       └─────────────┴─────────────┴─────────────┘      │
│                         │                               │
│              ┌──────────▼──────────┐                   │
│              │  Unified Schema     │                   │
│              │  {tables, relations}│                   │
│              └──────────┬──────────┘                   │
│                         │                               │
│       ┌─────────────────┼─────────────────┐            │
│       ▼                 ▼                 ▼            │
│  ┌─────────┐      ┌──────────┐      ┌─────────┐       │
│  │ Markdown│      │  JSON    │      │ Mermaid │       │
│  │ Output  │      │  Output  │      │ (v0.7)  │       │
│  └─────────┘      └──────────┘      └─────────┘       │
└─────────────────────────────────────────────────────────┘
```

## 데이터 스키마

### UnifiedSchema

```typescript
interface UnifiedSchema {
  dialect: 'postgresql' | 'mysql' | 'sqlite' | 'unknown';
  source: {
    type: 'prisma' | 'drizzle' | 'sql' | 'introspection';
    file?: string;
    connectionString?: string;
  };
  tables: Table[];
  enums?: Enum[];
}

interface Table {
  name: string;
  sourceFile?: string;
  sourceLine?: number;
  description?: string;
  columns: Column[];
  primaryKey?: string[];
  indexes: Index[];
  relations: Relation[];
}

interface Column {
  name: string;
  type: string;
  nullable: boolean;
  default?: string;
  primaryKey?: boolean;
  unique?: boolean;
  references?: {
    table: string;
    column: string;
  };
}

interface Index {
  name: string;
  columns: string[];
  unique: boolean;
}

interface Relation {
  name?: string;
  type: '1:1' | '1:N' | 'N:1' | 'N:M';
  fromTable: string;
  toTable: string;
  foreignKey: string;
}

interface Enum {
  name: string;
  values: string[];
}
```

## 파서 구현

### Prisma Parser

```typescript
// lib/parsers/prisma.mjs
import { readFile } from 'fs/promises';

export async function parsePrismaSchema(filePath: string): Promise<UnifiedSchema> {
  const content = await readFile(filePath, 'utf-8');

  // model 블록 파싱
  const modelRegex = /model\s+(\w+)\s*\{([^}]+)\}/g;
  // 필드 파싱: name Type @attributes
  // relation 파싱: @relation(...)

  return {
    dialect: detectDialectFromDatasource(content),
    source: { type: 'prisma', file: filePath },
    tables: parseModels(content),
    enums: parseEnums(content)
  };
}
```

### Drizzle Parser

```typescript
// lib/parsers/drizzle.mjs
import { parse } from '@babel/parser';
import traverse from '@babel/traverse';

export async function parseDrizzleSchema(filePath: string): Promise<UnifiedSchema> {
  const content = await readFile(filePath, 'utf-8');
  const ast = parse(content, { sourceType: 'module', plugins: ['typescript'] });

  // pgTable, sqliteTable 호출 찾기
  // 컬럼 정의 추출

  return { ... };
}
```

### SQL Parser

```typescript
// lib/parsers/sql.mjs
export async function parseSqlFiles(patterns: string[]): Promise<UnifiedSchema> {
  const files = await glob(patterns);

  for (const file of files) {
    const content = await readFile(file, 'utf-8');
    // CREATE TABLE 파싱
    // ALTER TABLE 파싱
    // CREATE INDEX 파싱
  }

  return { ... };
}
```

## CLI 인터페이스

```bash
# 자동 감지
zywiki schema
zywiki schema --auto

# 소스 명시
zywiki schema --prisma prisma/schema.prisma
zywiki schema --drizzle server/db/schema.ts
zywiki schema --sql "migrations/*.sql"
zywiki schema --db sqlite:./data.db
zywiki schema --db postgres://localhost/mydb

# 출력 옵션
zywiki schema --json
zywiki schema --output zywiki/database/
```

## 자동 감지 로직

```typescript
async function detectSchemaSource(projectPath: string): Promise<SchemaSource> {
  // 1. Prisma 확인
  if (await exists(join(projectPath, 'prisma/schema.prisma'))) {
    return { type: 'prisma', file: 'prisma/schema.prisma' };
  }

  // 2. Drizzle 확인
  if (await exists(join(projectPath, 'drizzle.config.ts'))) {
    const config = await loadDrizzleConfig(projectPath);
    return { type: 'drizzle', file: config.schema };
  }

  // 3. Supabase/SQL 마이그레이션 확인
  if (await exists(join(projectPath, 'supabase/migrations'))) {
    return { type: 'sql', pattern: 'supabase/migrations/*.sql' };
  }

  // 4. 없으면 안내
  throw new Error('No schema source detected. Use --prisma, --drizzle, --sql, or --db flag.');
}
```

## 마크다운 출력 형식

```markdown
# Table: users

<cite>prisma/schema.prisma:15</cite>

## Overview
사용자 계정 정보를 저장하는 테이블

## Columns
| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | TEXT | NO | uuid() | Primary Key |
| email | TEXT | NO | - | 사용자 이메일 |
| created_at | TIMESTAMP | NO | now() | 생성일시 |

## Relations
- `posts` → 1:N (users.id → posts.user_id)
- `profiles` → 1:1 (users.id → profiles.user_id)

## Indexes
- `users_email_idx` (email) UNIQUE
```

## 파일 구조

```
lib/
├── parsers/
│   ├── prisma.mjs
│   ├── drizzle.mjs
│   ├── sql.mjs
│   └── introspection.mjs
├── schema/
│   ├── detector.mjs       # 자동 감지
│   ├── unifier.mjs        # 통합 스키마 생성
│   └── renderer.mjs       # 마크다운/JSON 렌더링
└── commands/
    └── schema.mjs
```
