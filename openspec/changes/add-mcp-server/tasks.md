# Tasks: MCP 서버

ZyWiki v1.0.0 - MCP 서버

## Phase 1: 기반 설정

- [ ] @modelcontextprotocol/sdk 의존성 추가
- [ ] mcp-server/ 디렉토리 구조 생성
- [ ] TypeScript 설정 (mcp-server용)
- [ ] package.json에 zywiki-mcp bin 추가

## Phase 2: 서버 코어

- [ ] MCP 서버 진입점 구현 (mcp-server/index.ts)
- [ ] 도구 정의 (mcp-server/tools.ts)
- [ ] stdio transport 설정
- [ ] 에러 처리 유틸리티

## Phase 3: 도구 핸들러

- [ ] zywiki_status 핸들러 구현
- [ ] zywiki_search 핸들러 구현
- [ ] zywiki_build 핸들러 구현 (안전장치 포함)
- [ ] zywiki_schema 핸들러 구현
- [ ] zywiki_analyze 핸들러 구현

## Phase 4: 빌드 및 배포

- [ ] MCP 서버 빌드 스크립트 (npm run build:mcp)
- [ ] npx zywiki-mcp 실행 테스트
- [ ] Claude Code 설정 예시 작성

## Phase 5: 테스트

- [ ] 각 도구 단위 테스트
- [ ] MCP 프로토콜 준수 테스트
- [ ] 에러 응답 테스트

## Phase 6: 문서화

- [ ] MCP 서버 설정 문서 (README)
- [ ] 도구 사용 예시 문서
- [ ] CHANGELOG 업데이트
- [ ] 버전 1.0.0으로 업데이트
