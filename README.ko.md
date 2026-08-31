# Grounded Roundtable

**두 개 이상의 유튜브 인터뷰를, 모든 핵심 주장을 실제 영상에서 확인할 수 있는 근거 기반 가상 대담으로 만듭니다.**

[English README](README.md) · [Google Slides 예시](https://docs.google.com/presentation/d/1zP8h6n0cUX9D8Ui6xQOocPRvUoshRaIpijkeYpF8jNY/edit?usp=sharing)

![네이티브 YouTube 근거 슬라이드](docs/evidence-slide.png)

## 만들어지는 결과

- 원문의 범위와 불확실성을 유지한 자연스러운 한국어 대화
- AI가 구성한 가상 대담이라는 상시 표시
- 정확한 시작·종료 시간이 설정된 Google Slides 네이티브 YouTube 플레이어
- 플레이어 옆 채널 출처, 타임스탬프 링크, 자막 상태
- 근거 앵커가 없는 주장, 중복 클립, 겹친 플레이어를 찾는 검증
- 참가자의 실제 주장과 분리된 선택형 이종 분야 연결

## 설치

### Codex

```bash
git clone https://github.com/smartkwang/grounded-roundtable.git ~/.codex/skills/grounded-roundtable
```

### Claude Code

```bash
git clone https://github.com/smartkwang/grounded-roundtable.git ~/.claude/skills/grounded-roundtable
```

설치 후 새 에이전트 세션을 시작하세요.

## 사용법

```text
다음 유튜브 영상에 grounded-roundtable을 적용해줘.
- https://youtu.be/...
- https://youtu.be/...

렌즈: cross-domain
토론 방향: tension-first
대상 독자: 조직 리더
한국어 네이티브 Google Slides로 만들어줘.
```

`lens`는 무엇을 비교할지 정합니다.

- `same-domain`: 같은 분야 안의 입장을 비교
- `cross-domain`: 서로 다른 분야를 AI 진행자의 가설로 연결하고, 실제 적용의 중요한 차이까지 제시

`direction`은 대화의 흐름을 정합니다. `tension-first`, `common-ground-first`, `forecast-to-choice`, `solutions-first`를 지원합니다.

## 근거 구조

참가자의 주장은 타임스탬프가 있는 source anchor를 인용합니다. 이종 분야 연결은 AI가 작성한 `bridges`로 분리하며, 최소 두 출처의 근거와 분야별 실천 차이를 반드시 포함합니다.

```bash
node scripts/validate_manifest.mjs examples/manifest.json
node scripts/validate_native_structure.mjs presentation.json --evidence-slides=p4,p5,p6
```

## 한계

- 참가자들은 실제로 서로의 말을 듣거나 답하지 않았습니다.
- 자동 자막은 근거 위치를 찾는 데 활용할 수 있지만 직접 인용은 원음 검토가 필요합니다.
- 네이티브 재생은 영상 공개 상태와 Google Slides 권한에 영향을 받습니다.
- evidence anchor는 검토 지점이며, 생성된 문장이 그대로 발화됐다는 증명은 아닙니다.

## 기여

이슈와 Pull Request를 환영합니다. [CONTRIBUTING.md](CONTRIBUTING.md)를 참고하세요.

## 라이선스

MIT

