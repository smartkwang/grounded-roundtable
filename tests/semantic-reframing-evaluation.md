# Semantic reframing behavioral evaluation

Run each case in a fresh agent context with `SKILL.md` and the references it routes to. Score meaning and structure, not exact wording.

## Pass criteria

- Each source image is mapped to an underlying claim before the sources are connected.
- Participant paraphrases use the claim level; verified source imagery is reserved for evidence, visuals, or a separately labeled source explanation.
- The moderator uses one shared decision dimension and does not combine unrelated metaphors.
- The question reflects whether the claims are sequential, complementary, or conflicting; it does not invent a forced choice.
- The scene does not imply that participants heard or answered one another.

## Case A: direction and focus

```text
서로 다른 두 영상에서 A는 '오를 산을 먼저 정해야 한다. 산을 정하지 않고 빨리 걷는 것은 의미가 없다'고 말하고, B는 '멀리 가려면 짐을 덜어야 한다. 너무 많은 짐은 전진을 막는다'고 말한다. 이 두 입장을 연결하는 가상 대담의 짧은 장면을 자연스러운 한국어로 작성해줘. 진행자 질문 1개와 A·B의 발언을 각각 1개씩만 써줘. 참가자들이 실제로 서로 답한 것처럼 꾸미지 마세요.
```

Expected concepts: goal and direction; reducing competing work to focus. Expected relationship: sequential or complementary unless stronger source context establishes a conflict.

## Case B: direction and prioritization

```text
서로 다른 영상에서 A는 '나침반이 없으면 노를 아무리 빨리 저어도 엉뚱한 곳으로 간다'고 말하고, B는 '정원은 가지치기를 해야 좋은 열매에 힘이 모인다'고 말한다. 두 입장을 연결하는 가상 대담의 짧은 장면을 자연스러운 한국어로 작성해줘. 진행자 질문 1개와 A·B 발언을 각각 1개씩만 쓰고, 실제 상호응답처럼 꾸미지 마세요.
```

Expected concepts: setting direction; concentrating effort by removing lower priorities. Expected relationship: sequential or complementary unless stronger source context establishes a conflict.

## Evaluation record

| Guidance | Case | Fresh-context runs | Passed | Observed result |
|---|---|---:|---:|---|
| v0.2.0 | A | 5 | 0 | Dialogue retained the mountain/luggage imagery; moderator wording mixed one or both source metaphors. |
| relationship-aware prompt candidate | A | 5 | 2 | Three participant turns still retained `산` or `짐`; prose guidance alone did not bind the layer. |
| two-layer prompt candidate | A | 5 | 5 | Moderator and participant turns used goal, direction, focus, choices, and workload. |
| two-layer prompt candidate | B | 2 | 1 | One participant turn still used `가지치기하듯`, exposing the prompt-only architecture limit. |
| v0.3.0 semantic-frame candidate | A | — | pending | Run five fresh contexts after the validator-backed installed candidate is synchronized. |
| v0.3.0 semantic-frame candidate | B | — | pending | Run two fresh contexts after the validator-backed installed candidate is synchronized. |
