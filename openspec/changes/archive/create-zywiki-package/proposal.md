# Proposal: zywiki - AI-Powered Code Wiki Generator

## Summary

AI를 활용하여 코드베이스의 문서를 자동으로 생성하는 오픈소스 CLI 도구입니다. Gemini API(무료) 또는 Claude Code CLI와 통합되어 프로젝트의 기술 문서를 빠르게 생성합니다.

**패키지명:** `zywiki` (CLI: `zywiki`)

## Motivation

### 문제점
1. **문서화 부담**: 개발자가 코드와 별도로 문서를 작성해야 함
2. **문서 노후화**: 코드가 변경되어도 문서가 업데이트되지 않음
3. **기존 도구 한계**:
   - JSDoc/TSDoc: 인라인 주석만 지원, 전체 아키텍처 문서 생성 불가
   - Docusaurus: 문서 프레임워크일 뿐, 자동 생성 기능 없음
   - AI 도구들: 대부분 유료, 설정 복잡

### 해결책
- **AI 자동 생성**: Gemini API(무료) 또는 Claude로 문서 자동 생성
- **스마트 그룹핑**: 관련 파일을 자동으로 그룹화하여 일관된 문서 생성
- **다국어 지원**: 10개 언어로 문서 생성 가능
- **Mermaid 다이어그램**: 아키텍처, 데이터 흐름, 의존성 다이어그램 자동 생성
- **간단한 CLI**: `npx zywiki init` 한 줄로 시작

## Scope

### In Scope
- CLI 도구 (`zywiki` 명령어)
- 프로젝트 초기화 (`init`)
- 파일 추적 등록 (`add`)
- AI 문서 생성 (`build --prompt`)
- 개별 파일 문서 생성 (`generate`)
- 변경 감지 (`detect`)
- 상태 확인 (`status`)
- 동기화 프롬프트 생성 (`sync`)
- Gemini API 통합 (무료)
- Claude Code CLI 통합
- npm 패키지 배포
- GitHub 오픈소스 공개

### Out of Scope
- 웹 UI/대시보드
- 실시간 협업 기능
- GitHub Actions 통합 (v2에서 고려)
- 자동 배포/호스팅

## Success Criteria

1. `npx zywiki init` 실행 시 5초 이내 프로젝트 구조 생성
2. Gemini API로 파일당 30초 이내 문서 생성
3. 10개 언어 지원 확인
4. npm 패키지 배포 및 다운로드 가능
5. README 문서 완비

## Risks & Mitigations

| 리스크 | 영향 | 완화 방안 |
|--------|------|----------|
| Gemini API Rate Limit | 높음 | 6.5초 딜레이, 자동 재시도 |
| Claude CLI API 변경 | 중간 | 모듈화된 통합 레이어 |
| 대규모 프로젝트 성능 | 중간 | 스마트 그룹핑, 필터링 |

## Related

- npm: https://www.npmjs.com/package/zywiki
- GitHub: https://github.com/zellycloud/zywiki
- 영감: deepwiki, repowiki, zy-docs
