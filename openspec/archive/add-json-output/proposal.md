# Proposal: add-json-output

## Summary

모든 CLI 명령에 `--json` 플래그를 추가하여 구조화된 JSON 출력을 지원합니다. 이를 통해 AI 에이전트가 ZyWiki의 상태와 결과를 프로그래밍적으로 파싱하고 활용할 수 있게 됩니다.

## Motivation

### 현재 상태 (v0.3.0)
- `zywiki search --json`만 JSON 출력 지원
- 나머지 명령어는 텍스트 출력만 제공
- AI 에이전트가 결과를 파싱하기 어려움

### 문제점
1. **에이전트 친화성 부족**: 텍스트 출력은 파싱이 불안정함
2. **상태 조회 불가**: "뭐가 문서화됐는지" 구조화된 방식으로 확인 불가
3. **자동화 어려움**: 빌드 결과를 프로그래밍적으로 판단할 수 없음

### 해결책
모든 CLI 명령에 `--json` 플래그를 추가하여:
- `status --json`: 구조화된 상태 정보
- `build --json`: 빌드 결과 리포트
- `stack --json`: 기술 스택 정보
- 매니페스트 자동 생성: `.zywiki/manifest.json`

## Target Version

**v0.4.0**

## Scope

### In Scope
- `zywiki status --json` 구현
- `zywiki build --json` 결과 리포트
- `zywiki stack --json` 구현
- `.zywiki/manifest.json` 자동 생성

### Out of Scope
- MCP 서버 (v1.0.0)
- SQL 스키마 문서화 (v0.5.0)
- 세분화 빌드 옵션 (v0.6.0)

## Success Criteria

1. 모든 주요 CLI 명령이 `--json` 플래그를 지원
2. JSON 출력 스키마가 문서화됨
3. 빌드 시 `.zywiki/manifest.json`이 자동 생성됨
4. AI 에이전트가 JSON 출력을 파싱하여 다음 작업을 결정할 수 있음

## Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| JSON 스키마 변경 시 하위 호환성 문제 | Medium | High | 버전 필드 추가, 스키마 문서화 |
| 기존 텍스트 출력에 의존하는 스크립트 | Low | Low | `--json`은 opt-in, 기본값은 텍스트 유지 |

## References

- [ZyWiki 로드맵](../../../docs/zywiki-roadmap.md) (zyflow 프로젝트)
- 에이전트 피드백: 구조화된 출력 필요성
