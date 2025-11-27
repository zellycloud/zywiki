/**
 * ai-generator.mjs
 * AI-powered documentation content generator (qoder-style)
 */

import fs from 'fs';
import path from 'path';
import { parseFile } from './parser.mjs';

/**
 * Generate AI-ready prompt for documentation
 * Claude CLI will read the files directly
 */
export function generateDocPrompt(group, options = {}) {
  const { language = 'ko' } = options;
  const lines = [];

  // Language-specific instructions (same as deepwiki)
  const langInstructions = {
    ko: '한국어로 작성',
    en: 'Write in English',
    ja: '日本語で作成',
    zh: '用简体中文编写',
    'zh-tw': '用繁體中文編寫',
    es: 'Escribir en español',
    vi: 'Viết bằng tiếng Việt',
    'pt-br': 'Escrever em português',
    fr: 'Écrire en français',
    ru: 'Написать на русском языке',
  };

  const langText = langInstructions[language] || langInstructions.ko;

  lines.push(`"${group.title}" 기술 문서를 작성해주세요.`);
  lines.push('');
  lines.push('참조 파일:');
  for (const file of group.files) {
    lines.push(`- ${file.path}`);
  }
  lines.push('');
  lines.push('형식 (200~300줄 목표):');
  lines.push('- 상단에 <cite>파일경로</cite> 블록');
  lines.push('- 개요: 목적과 역할 설명 (2~3문장)');
  lines.push('- Mermaid 다이어그램 2~3개 (아키텍처, 데이터흐름, 의존성 중 선택)');
  lines.push('- 주요 함수/클래스 (이름, 시그니처, 설명) - 리스트 형식으로, 테이블 사용 금지');
  lines.push('- 설정/사용법 섹션 (실제 사용 코드 1~2개)');
  lines.push('- 문제 해결 가이드 (흔한 이슈 2~3개)');
  lines.push('');
  lines.push('중요:');
  lines.push(`- ${langText}`);
  lines.push('- 순수 마크다운만 출력 (```markdown 블록으로 감싸지 말 것)');
  lines.push('- 설명/메타 텍스트 없이 문서 내용만 출력');
  lines.push('- 첫 줄부터 바로 <cite> 블록으로 시작');
  lines.push('');
  lines.push('절대 금지:');
  lines.push('- 내부 생각/계획 출력 금지 (예: "I will...", "Let me...", "The user is asking...")');
  lines.push('- 응답 전 분석/설명 금지');
  lines.push('- 테이블 칸에 500자 이상 텍스트 금지');
  lines.push('');
  lines.push('지금 바로 <cite>로 시작하는 마크다운 문서만 출력하세요.');

  return lines.join('\n');
}

/**
 * Generate documentation template with auto-generated content
 * Analyzes code to produce meaningful documentation
 */
export function generateDocTemplate(group, options = {}) {
  const { root } = options;
  const lines = [];

  // Collect all parsed data first
  const allClasses = [];
  const allFunctions = [];
  const allExports = [];
  const allImports = new Map(); // source -> dependencies
  const externalDeps = new Set();
  const internalDeps = new Set();

  for (const file of group.files) {
    const filePath = root ? path.join(root, file.path) : file.path;
    const parsed = parseFile(filePath);

    if (parsed?.classes) {
      for (const cls of parsed.classes) {
        allClasses.push({ ...cls, file: file.path });
      }
    }
    if (parsed?.functions) {
      for (const func of parsed.functions) {
        allFunctions.push({ ...func, file: file.path });
      }
    }
    if (parsed?.exports) {
      for (const exp of parsed.exports) {
        allExports.push({ ...exp, file: file.path });
      }
    }

    // Analyze imports
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const imports = extractImports(content);
      allImports.set(file.path, imports);

      for (const imp of imports) {
        if (!imp.path.startsWith('.') && !imp.path.startsWith('@/')) {
          const depName = imp.path.split('/')[0];
          if (depName && !depName.startsWith('node:')) {
            externalDeps.add(depName);
          }
        } else if (imp.path.startsWith('@/')) {
          internalDeps.add(imp.path.replace('@/', ''));
        }
      }
    } catch {
      // Skip
    }
  }

  // Title
  lines.push(`# ${group.title}`);
  lines.push('');

  // Cite block
  lines.push('<cite>');
  lines.push('**이 문서에서 참조한 파일**');
  for (const file of group.files) {
    const parsed = root ? parseFile(path.join(root, file.path)) : null;
    const lineRange = parsed ? `#L1-L${parsed.lines}` : '';
    lines.push(`- [${path.basename(file.path)}](file://${file.path}${lineRange})`);
  }
  lines.push('</cite>');
  lines.push('');

  // Table of contents
  lines.push('## 목차');
  lines.push('1. [소개](#소개)');
  lines.push('2. [아키텍처 개요](#아키텍처-개요)');
  lines.push('3. [핵심 구성 요소](#핵심-구성-요소)');
  lines.push('4. [의존성 분석](#의존성-분석)');
  lines.push('5. [사용 예시](#사용-예시)');
  lines.push('6. [관련 문서](#관련-문서)');
  lines.push('');

  // Introduction - auto-generated based on analysis
  lines.push('## 소개');
  lines.push('');
  lines.push(generateIntroduction(group, { allClasses, allFunctions, allExports, externalDeps }));
  lines.push('');

  // Architecture overview with Mermaid diagram
  lines.push('## 아키텍처 개요');
  lines.push('');
  lines.push('```mermaid');
  lines.push(generateMermaidDiagram(group, options));
  lines.push('```');
  lines.push('');
  lines.push('**Diagram sources**');
  for (const file of group.files.slice(0, 5)) {
    lines.push(`- [${path.basename(file.path)}](file://${file.path})`);
  }
  lines.push('');

  // Core components
  lines.push('## 핵심 구성 요소');
  lines.push('');

  if (allClasses.length > 0) {
    lines.push('### 클래스');
    lines.push('');
    for (const cls of allClasses.slice(0, 10)) {
      lines.push(`#### ${cls.name}`);
      lines.push(`*출처: [${path.basename(cls.file)}](file://${cls.file}#L${cls.line})*`);
      lines.push('');
      lines.push(generateClassDescription(cls, group));
      lines.push('');
    }
  }

  if (allFunctions.length > 0) {
    lines.push('### 주요 함수');
    lines.push('');
    for (const func of allFunctions.slice(0, 15)) {
      lines.push(`- \`${func.name}\` - *[${path.basename(func.file)}:${func.line}](file://${func.file}#L${func.line})*`);
    }
    lines.push('');
  }

  // Dependencies - auto-generated
  lines.push('## 의존성 분석');
  lines.push('');
  lines.push(generateDependencyAnalysis(externalDeps, internalDeps));
  lines.push('');
  lines.push('```mermaid');
  lines.push(generateDependencyDiagram(group, options));
  lines.push('```');
  lines.push('');

  // Usage example - auto-generated
  lines.push('## 사용 예시');
  lines.push('');
  lines.push('```typescript');
  lines.push(generateUsageExample(group, { allExports, allFunctions, allClasses }));
  lines.push('```');
  lines.push('');

  // Related documents
  lines.push('## 관련 문서');
  lines.push('');
  lines.push(generateRelatedDocs(group, internalDeps));
  lines.push('');

  return lines.join('\n');
}

/**
 * Generate introduction text based on code analysis
 */
function generateIntroduction(group, { allClasses, allFunctions, allExports, externalDeps }) {
  const lines = [];
  const category = group.category;
  const fileCount = group.files.length;

  // Determine module type and purpose
  const isHook = group.key.includes('hook') || allFunctions.some(f => f.name.startsWith('use'));
  const isComponent = group.key.includes('component') || category === 'features';
  const isService = group.key.includes('service') || group.key.includes('lib');
  const isAgent = group.key.includes('agent');
  const isPage = group.key.includes('page');

  if (isHook) {
    const hookNames = allFunctions.filter(f => f.name.startsWith('use')).map(f => f.name);
    lines.push(`이 모듈은 **${hookNames.length}개의 React 커스텀 훅**을 제공합니다.`);
    if (externalDeps.has('@tanstack')) {
      lines.push('TanStack Query (React Query)를 기반으로 서버 상태 관리와 캐싱을 처리합니다.');
    }
    if (hookNames.length > 0) {
      lines.push('');
      lines.push('**주요 훅:**');
      for (const name of hookNames.slice(0, 5)) {
        lines.push(`- \`${name}\``);
      }
      if (hookNames.length > 5) {
        lines.push(`- ... 외 ${hookNames.length - 5}개`);
      }
    }
  } else if (isAgent) {
    lines.push(`이 모듈은 **AI 에이전트 시스템**을 구현합니다.`);
    if (allClasses.length > 0) {
      lines.push(`${allClasses[0].name} 클래스가 핵심 로직을 담당합니다.`);
    }
  } else if (isPage) {
    lines.push(`이 모듈은 **페이지 컴포넌트**를 정의합니다.`);
    lines.push('라우팅과 연결되어 사용자 인터페이스를 제공합니다.');
  } else if (isComponent) {
    lines.push(`이 모듈은 **${fileCount}개의 React 컴포넌트**로 구성됩니다.`);
    if (allExports.length > 0) {
      const componentExports = allExports.filter(e => /^[A-Z]/.test(e.name));
      if (componentExports.length > 0) {
        lines.push('');
        lines.push('**제공 컴포넌트:**');
        for (const exp of componentExports.slice(0, 5)) {
          lines.push(`- \`${exp.name}\``);
        }
      }
    }
  } else if (isService) {
    lines.push(`이 모듈은 **비즈니스 로직과 서비스 함수**를 제공합니다.`);
    if (allFunctions.length > 0) {
      lines.push(`총 ${allFunctions.length}개의 함수가 정의되어 있습니다.`);
    }
  } else {
    lines.push(`이 모듈은 ${fileCount}개의 파일로 구성되어 있으며,`);
    lines.push(`${allFunctions.length}개의 함수와 ${allClasses.length}개의 클래스를 포함합니다.`);
  }

  return lines.join('\n');
}

/**
 * Generate class description
 */
function generateClassDescription(cls, group) {
  const name = cls.name;

  // Infer purpose from naming convention
  if (name.endsWith('Agent')) {
    return `\`${name}\`는 특정 도메인의 AI 에이전트 로직을 캡슐화합니다. 사용자 요청을 분석하고 적절한 액션을 수행합니다.`;
  }
  if (name.endsWith('Service')) {
    return `\`${name}\`는 비즈니스 로직을 담당하는 서비스 클래스입니다.`;
  }
  if (name.endsWith('Provider')) {
    return `\`${name}\`는 React Context Provider로, 하위 컴포넌트에 상태와 기능을 제공합니다.`;
  }
  if (name.endsWith('Store')) {
    return `\`${name}\`는 애플리케이션 상태를 관리하는 스토어 클래스입니다.`;
  }

  return `\`${name}\` 클래스는 ${group.title} 기능의 핵심 로직을 구현합니다.`;
}

/**
 * Generate dependency analysis text
 */
function generateDependencyAnalysis(externalDeps, internalDeps) {
  const lines = [];

  if (externalDeps.size > 0) {
    lines.push('**외부 의존성:**');
    for (const dep of Array.from(externalDeps).slice(0, 10)) {
      const depDesc = getDepDescription(dep);
      lines.push(`- \`${dep}\`${depDesc ? ` - ${depDesc}` : ''}`);
    }
    lines.push('');
  }

  if (internalDeps.size > 0) {
    lines.push('**내부 의존성:**');
    for (const dep of Array.from(internalDeps).slice(0, 8)) {
      lines.push(`- \`@/${dep}\``);
    }
  }

  if (lines.length === 0) {
    lines.push('이 모듈은 독립적으로 동작하며 최소한의 의존성을 가집니다.');
  }

  return lines.join('\n');
}

/**
 * Get description for common dependencies
 */
function getDepDescription(dep) {
  const descriptions = {
    'react': 'UI 라이브러리',
    '@tanstack': '서버 상태 관리 (React Query)',
    'zustand': '클라이언트 상태 관리',
    'zod': '스키마 검증',
    'date-fns': '날짜 처리',
    'lucide-react': '아이콘',
    '@supabase': '백엔드 서비스',
    'sonner': '토스트 알림',
    'framer-motion': '애니메이션',
    'recharts': '차트 라이브러리',
  };
  return descriptions[dep] || '';
}

/**
 * Generate usage example
 */
function generateUsageExample(group, { allExports, allFunctions, allClasses }) {
  const lines = [];
  const isHook = allFunctions.some(f => f.name.startsWith('use'));

  if (isHook) {
    const hooks = allFunctions.filter(f => f.name.startsWith('use'));
    const mainHook = hooks[0];
    if (mainHook) {
      lines.push(`import { ${mainHook.name} } from '@/hooks/queries/${path.basename(mainHook.file, '.ts')}';`);
      lines.push('');
      lines.push('function MyComponent() {');
      lines.push(`  const { data, isLoading, error } = ${mainHook.name}();`);
      lines.push('');
      lines.push('  if (isLoading) return <div>Loading...</div>;');
      lines.push('  if (error) return <div>Error occurred</div>;');
      lines.push('');
      lines.push('  return <div>{/* Use data here */}</div>;');
      lines.push('}');
    }
  } else if (allClasses.length > 0) {
    const mainClass = allClasses[0];
    lines.push(`import { ${mainClass.name} } from '@/${mainClass.file.replace(/\.(ts|tsx)$/, '')}';`);
    lines.push('');
    lines.push(`const instance = new ${mainClass.name}();`);
    lines.push('// Use instance methods');
  } else if (allExports.length > 0) {
    const mainExport = allExports.find(e => e.type === 'function') || allExports[0];
    if (mainExport) {
      const importPath = mainExport.file.replace(/\.(ts|tsx)$/, '');
      lines.push(`import { ${mainExport.name} } from '@/${importPath}';`);
      lines.push('');
      if (mainExport.type === 'function') {
        lines.push(`const result = ${mainExport.name}();`);
      } else {
        lines.push(`// Use ${mainExport.name}`);
      }
    }
  } else {
    lines.push('// 이 모듈의 사용 방법은 각 함수/컴포넌트의 JSDoc을 참조하세요.');
  }

  return lines.join('\n');
}

/**
 * Generate related documentation links
 */
function generateRelatedDocs(group, internalDeps) {
  const lines = [];
  const category = group.category;

  // Suggest related categories
  const relatedCategories = {
    'features': ['hooks', 'components'],
    'api': ['database', 'security'],
    'architecture': ['guides', 'api'],
    'testing': ['features', 'api'],
  };

  const related = relatedCategories[category] || ['features'];

  for (const rel of related) {
    lines.push(`- [${rel} 문서](../${rel}/)`);
  }

  // Add links based on internal dependencies
  for (const dep of Array.from(internalDeps).slice(0, 3)) {
    const docPath = dep.replace(/\//g, '-');
    lines.push(`- [${dep}](../features/${docPath}.md)`);
  }

  return lines.join('\n');
}

/**
 * Generate Mermaid diagram for a group
 */
export function generateMermaidDiagram(group, options = {}) {
  const { root } = options;
  const lines = ['graph TD'];

  // Analyze structure
  const nodes = [];
  const edges = [];

  // Create nodes for each file
  for (const file of group.files) {
    const baseName = path.basename(file.path, path.extname(file.path));
    const nodeId = baseName.replace(/[^a-zA-Z0-9]/g, '_');
    nodes.push({ id: nodeId, label: baseName, file: file.path });
  }

  // Analyze imports to create edges
  for (const file of group.files) {
    const filePath = root ? path.join(root, file.path) : file.path;
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const imports = extractImports(content);

      const sourceId = path.basename(file.path, path.extname(file.path))
        .replace(/[^a-zA-Z0-9]/g, '_');

      for (const imp of imports) {
        // Check if imported file is in our group
        const targetNode = nodes.find(n =>
          imp.path.includes(n.label) ||
          imp.path.endsWith(n.label)
        );

        if (targetNode && targetNode.id !== sourceId) {
          edges.push({ from: sourceId, to: targetNode.id });
        }
      }
    } catch {
      // Skip
    }
  }

  // Build diagram
  for (const node of nodes) {
    lines.push(`    ${node.id}["${node.label}"]`);
  }

  for (const edge of edges) {
    lines.push(`    ${edge.from} --> ${edge.to}`);
  }

  // If no edges, create a simple structure
  if (edges.length === 0 && nodes.length > 1) {
    const mainNode = nodes[0];
    for (let i = 1; i < nodes.length; i++) {
      lines.push(`    ${mainNode.id} --> ${nodes[i].id}`);
    }
  }

  return lines.join('\n');
}

/**
 * Generate dependency diagram
 */
function generateDependencyDiagram(group, options = {}) {
  const { root } = options;
  const lines = ['graph LR'];

  const groupName = group.key.split('/').pop().replace(/[^a-zA-Z0-9]/g, '_');
  const externalDeps = new Set();

  for (const file of group.files) {
    const filePath = root ? path.join(root, file.path) : file.path;
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const imports = extractImports(content);

      for (const imp of imports) {
        // External dependencies (node_modules or absolute paths)
        if (!imp.path.startsWith('.') && !imp.path.startsWith('@/')) {
          const depName = imp.path.split('/')[0];
          if (depName && !depName.startsWith('node:')) {
            externalDeps.add(depName);
          }
        }
      }
    } catch {
      // Skip
    }
  }

  lines.push(`    ${groupName}["${group.title}"]`);

  let i = 0;
  for (const dep of Array.from(externalDeps).slice(0, 10)) {
    const depId = `ext_${i++}`;
    lines.push(`    ${depId}["${dep}"]`);
    lines.push(`    ${groupName} --> ${depId}`);
  }

  return lines.join('\n');
}

/**
 * Extract imports from TypeScript/JavaScript content
 */
function extractImports(content) {
  const imports = [];
  const lines = content.split('\n');

  const importRegex = /import\s+(?:(?:\{[^}]*\}|[\w*]+)\s+from\s+)?['"]([^'"]+)['"]/;

  for (const line of lines) {
    const match = line.match(importRegex);
    if (match) {
      imports.push({ path: match[1] });
    }
  }

  return imports;
}

/**
 * Truncate content to a maximum length
 */
function truncateContent(content, maxLines) {
  const lines = content.split('\n');
  if (lines.length <= maxLines) {
    return content;
  }

  const truncated = lines.slice(0, maxLines).join('\n');
  return truncated + `\n\n// ... (${lines.length - maxLines} more lines truncated)`;
}
