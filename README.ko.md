# Grounded Roundtable

**두 개 이상의 유튜브 대담을, 모든 핵심 주장을 실제 타임스탬프에서 다시 확인할 수 있는 가상 대담으로 바꿉니다.**

[English README](README.md) · [Google Slides 완성 예시](https://docs.google.com/presentation/d/1zP8h6n0cUX9D8Ui6xQOocPRvUoshRaIpijkeYpF8jNY/edit?usp=sharing)

![네이티브 YouTube 근거 슬라이드](docs/evidence-slide.png)

긴 영상 여러 편을 모두 보고, 각 인물의 주장을 기억한 뒤 서로 연결해 생각하는 일은 어렵습니다. Grounded Roundtable은 이 과정을 돕는 Codex·Claude Code용 사고 도구입니다.

- 실제 만남으로 오해하지 않도록 명확히 표시한 **가상** 대담
- 원문의 강도와 조건을 유지한 자연스러운 한국어 의역
- 정확한 시작·종료 구간을 가진 Google Slides 네이티브 YouTube 플레이어
- 플레이어 옆의 타임스탬프 링크, 채널 출처, 자막 상태
- 동일 클립의 중복 노출과 영상 겹침을 막는 검증
- 대상 독자에게 전할 한 문장과 행동 제안

## 결과부터 보기

샘플 덱은 빌 게이츠·유발 하라리·일론 머스크의 서로 다른 인터뷰를 연결해 “AI가 제도보다 빠르게 강해질 때 인간은 어떻게 주도권을 유지할까?”를 다룹니다.

[네이티브 Google Slides 덱 열기](https://docs.google.com/presentation/d/1zP8h6n0cUX9D8Ui6xQOocPRvUoshRaIpijkeYpF8jNY/edit?usp=sharing)

![대상 독자를 위한 핵심 메시지](docs/takeaway-slide.png)

## 설치

### Codex

```bash
git clone https://github.com/smartkwang/grounded-roundtable.git ~/.codex/skills/grounded-roundtable
```

### Claude Code

```bash
git clone https://github.com/smartkwang/grounded-roundtable.git ~/.claude/skills/grounded-roundtable
```

설치 후 새 에이전트 세션을 시작하세요. 사용하는 도구의 스킬 디렉터리가 다르다면 저장소 내부 구조를 유지한 채 해당 위치에 복제하면 됩니다.

## 사용법

유튜브 URL을 두 개 이상 제공하세요. 토론 방향, 대상 독자, 최종 메시지도 지정할 수 있습니다.

```text
다음 유튜브 영상 3개에 grounded-roundtable을 적용해줘.
- https://youtu.be/...
- https://youtu.be/...
- https://youtu.be/...

토론 방향: tension-first
대상 독자: AI를 도입하려는 교육자와 조직 리더
한국어 네이티브 Google Slides로 만들어줘.
```

지원하는 토론 방향:

- `tension-first`: 가장 강한 긴장부터
- `common-ground-first`: 공통점에서 차이로
- `forecast-to-choice`: 전망에서 선택으로
- `solutions-first`: 해결책 중심

## 근거를 지키는 방식

대화를 쓰기 전에 evidence manifest를 먼저 만듭니다. 참가자의 모든 주장은 화자, 영상 ID, 시작·종료 시각, 전사 구간, 검토 상태가 기록된 anchor에 연결됩니다.

렌더링 단계에서는 `video_id + start + end`가 같은 클립을 한 번만 보여줍니다. 뒤의 대화가 앞선 생각을 이어갈 수는 있지만, 같은 플레이어나 타임스탬프 카드를 다시 만들지는 않습니다.

```bash
node scripts/validate_manifest.mjs examples/manifest.json
node scripts/validate_native_structure.mjs presentation.json --evidence-slides=p4,p5,p6
```

## 토큰 비용을 줄이는 방식

자막은 한 번만 가져와 저장하고, 간결한 evidence map을 만든 뒤 선택된 장면에만 생성 토큰을 사용합니다. 예산이 부족하면 출처 검증을 줄이지 않고 주제 수, 장면 수, 대화 턴, 장식을 순서대로 줄입니다.

## 주의할 점

- 가상 대담이며 인물들이 실제로 서로의 말을 듣거나 답한 것이 아닙니다.
- 자동 생성 자막은 근거 구간을 찾는 데 활용할 수 있지만, 직접 인용은 원음 대조가 필요합니다.
- 의역은 원문의 불확실성·조건·범위를 더 강하게 바꾸면 안 됩니다.
- 네이티브 영상 재생은 원본 영상의 공개 상태와 Google Slides 권한에 영향을 받습니다.
- 실제 동의·지지·만남이 있었던 것처럼 사용하면 안 됩니다.

## 기여

새로운 토론 방향, 자연스러운 언어 규칙, 근거 검증기, 슬라이드 테마에 관한 이슈와 PR을 환영합니다. 자세한 내용은 [CONTRIBUTING.md](CONTRIBUTING.md)를 참고하세요.

## 라이선스

MIT

