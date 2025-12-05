# add-mcp-server

MCP (Model Context Protocol) 서버를 추가하여 에이전트가 CLI 없이 직접 ZyWiki 기능을 호출할 수 있게 합니다.

## 버전

v1.0.0

## 패러다임 전환

이 버전이 v1.0.0인 이유:
- **v0.x**: 사람이 CLI 실행 → 결과 확인
- **v1.0**: 에이전트가 직접 도구 호출 → 자동화 가능

CLI에서 MCP로의 전환은 "에이전트 친화적 지식 인프라"로의 본격적인 전환점입니다.

## 배경

현재 에이전트가 ZyWiki를 사용하려면 Bash 도구로 CLI를 실행해야 합니다. 이는 에러 처리, 출력 파싱에 오버헤드가 있습니다. MCP 서버를 통해 네이티브 도구로 직접 호출하면 더 효율적입니다.

## 목표

- MCP 프로토콜 준수 서버 구현
- 핵심 ZyWiki 기능을 MCP 도구로 노출
- Claude Code, Cursor 등에서 직접 사용 가능

## 범위

### 포함

MCP 도구:
- `zywiki_status` - 문서화 상태 조회
- `zywiki_search` - 문서 검색
- `zywiki_build` - 문서 빌드
- `zywiki_schema` - 스키마 조회
- `zywiki_analyze` - 문서화 필요성 분석

### 제외

- MCP Resources (도구만 먼저 구현)
- MCP Prompts

## 성공 기준

1. `npx zywiki-mcp`로 MCP 서버 실행 가능
2. Claude Code 설정에 추가하여 도구 사용 가능
3. JSON 응답 직접 반환 (파싱 불필요)

## 의존성

- v0.4.0 (JSON 출력)
- v0.5.0 (schema 명령어)
- v0.6.0 (안전장치)
