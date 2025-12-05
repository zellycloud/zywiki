# Tasks: MCP 서버

## Group 1: 기반 설정

- [ ] task-1-1: @modelcontextprotocol/sdk 의존성 추가
- [ ] task-1-2: mcp-server/ 디렉토리 구조 생성
- [ ] task-1-3: TypeScript 설정 (mcp-server용)
- [ ] task-1-4: package.json에 zywiki-mcp bin 추가

## Group 2: 서버 코어

- [ ] task-2-1: MCP 서버 진입점 구현 (mcp-server/index.ts)
- [ ] task-2-2: 도구 정의 (mcp-server/tools.ts)
- [ ] task-2-3: stdio transport 설정
- [ ] task-2-4: 에러 처리 유틸리티

## Group 3: 도구 핸들러

- [ ] task-3-1: zywiki_status 핸들러 구현
- [ ] task-3-2: zywiki_search 핸들러 구현
- [ ] task-3-3: zywiki_build 핸들러 구현 (안전장치 포함)
- [ ] task-3-4: zywiki_schema 핸들러 구현
- [ ] task-3-5: zywiki_analyze 핸들러 구현

## Group 4: 빌드 및 배포

- [ ] task-4-1: MCP 서버 빌드 스크립트 (npm run build:mcp)
- [ ] task-4-2: npx zywiki-mcp 실행 테스트
- [ ] task-4-3: Claude Code 설정 예시 작성

## Group 5: 테스트

- [ ] task-5-1: 각 도구 단위 테스트
- [ ] task-5-2: MCP 프로토콜 준수 테스트
- [ ] task-5-3: 에러 응답 테스트

## Group 6: 문서화

- [ ] task-6-1: MCP 서버 설정 문서 (README)
- [ ] task-6-2: 도구 사용 예시 문서
- [ ] task-6-3: CHANGELOG 업데이트
- [ ] task-6-4: 버전 1.0.0으로 업데이트
