# Cross-domain bridges

Read this reference only when `lens` is `cross-domain`.

## Boundary

Participant `claims` contain only what their own source supports. A relationship inferred across fields belongs in `bridges` and is authored by `AI moderator`. Never give a participant a `cross_domain_analogy` claim or imply that they recognized the other field.

## Cognitive-bridge pattern

Build each bridge after the audience has seen the relevant claims and evidence:

1. State the source-bounded principle from field A.
2. State the source-bounded principle from field B.
3. Offer one tentative connection as an AI-generated question or hypothesis.
4. Name the most important difference in how the principle operates.
5. End with a decision or reflection question for the audience.

The moderator translates domain language into a shared term without erasing the domains. Prefer `두 발언은 …로 연결해 볼 수 있습니다` or `같은 원리일까요, 표면적으로만 닮은 것일까요?` over `두 사람은 같은 철학을 갖고 있습니다`.

## Bridge contract

```json
{
  "bridge_id": "B01",
  "author": "AI moderator",
  "label": "cross_domain_hypothesis",
  "meta_theme": "simplification",
  "text": "두 발언은 불필요한 것을 덜어내 핵심을 선명하게 만든다는 원리로 연결해 볼 수 있다.",
  "support_anchor_ids": ["A03", "A07"],
  "confidence": "tentative",
  "difference": "요리는 감각적 결과를, 소프트웨어는 유지보수성을 판단 기준으로 삼는다."
}
```

- `label`: use `cross_domain_hypothesis` for a plausible connection and `cross_domain_boundary` when the important result is why two ideas should not be collapsed.
- `support_anchor_ids`: include at least two anchors from different sources.
- `confidence`: `tentative`, `moderate`, or `strong`; default to `tentative` unless the sources explicitly express the shared principle.
- `difference`: required. State how goals, mechanisms, constraints, or success criteria differ across fields.

## Selection rule

Generate a small set of candidate themes, then keep only the strongest one or two. A usable bridge has evidence on both sides, a shared abstraction no broader than the evidence, and a consequential difference. If no candidate meets that standard, use a `cross_domain_boundary` bridge instead of inventing a universal lesson.

## Slide unit

Use this sequence when the bridge is central:

1. field A claim;
2. field A evidence player;
3. field B claim;
4. field B evidence player;
5. AI moderator bridge: shared principle and confidence;
6. practice difference: how the principle changes across fields;
7. audience question.

Keep the bridge and difference visually separate from participant speech. They do not need another video player because their supporting anchors have already been shown.

## Common mistakes

- Assigning the bridge to a participant.
- Treating shared vocabulary as proof of a shared principle.
- Writing only a flattering commonality such as effort, passion, or fundamentals.
- Hiding the difference in speaker notes instead of showing it to the audience.
- Adding more anchors after the bridge and repeating already-rendered clips.

