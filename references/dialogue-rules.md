# Dialogue rules

## Scene rhythm

Use one strong question per scene. A good default is:

1. moderator frames the question;
2. participant A states an anchored position;
3. participant B introduces the strongest tension;
4. moderator restates the tension without pretending anyone replied;
5. participant C adds a condition, trade-off, or alternative;
6. moderator narrows the next decision;
7. one or two additional turns deepen the issue;
8. evidence anchors follow the scene.

The six-to-ten turns are a narrative rhythm, not a license to manufacture more claims. Keep one atomic claim per participant turn and let the moderator carry transitions.

## Cognitive bridges

When `lens` is `cross-domain`, the moderator connects the fields only after both source positions and anchors are established. Phrase the connection as an AI-generated hypothesis or question, then state the most important difference in goals, mechanisms, constraints, or success criteria. The bridge belongs in `bridges`, never in a participant `claim`. Read [cross-domain bridges](cross-domain-bridges.md) for the schema and slide unit.

## Labels and language

- `direct_quote`: exact source language, quotation marks allowed only after anchor and audio review.
- `faithful_paraphrase`: translated or compressed source meaning, no quotation marks.
- `multi_anchor_synthesis`: a new synthesis grounded in two or more anchors; list every anchor.
- `moderator`: connective question or analytical framing. Mark it as AI-generated when it includes interpretation.

Every participant turn should show a compact evidence ID (for example `E03`) and the deck notes should contain the source URL. Keep the persistent disclosure: `AI가 구성한 가상 대담 · 실제 만남이나 실제 상호응답을 재현한 것이 아닙니다`.

### Evidence reference deduplication

- Render each evidence anchor on one evidence slide only. The same exact clip (`video_id + start + end`) must never receive a second player.
- If a later turn continues an already-supported point, write `앞서 본 근거를 이어서 보면` (or similar) and omit the evidence ID from the visible turn. Keep the mapping in speaker notes instead of repeating a player or a timestamp card.
- Reusing the same source video is allowed only for a genuinely different, non-overlapping anchor with a different range. Never solve a missing anchor by copying an earlier evidence card.

## Korean naturalness pass

Use the transcript to recover meaning, then write as a Korean editor would write for speech. Use concrete verbs over nominalized chains such as `~하는 것에 대한 필요성이 있습니다`. Use `~일 수 있다` only when the source genuinely expresses possibility; do not repeat the same ending to manufacture caution. Replace English order (`주어 + 긴 수식어 + 명사`) with a short clause sequence. Preserve hedges (`가능성이 있다`, `~일 수 있다`), conditions (`만약`, `~할 때`), and scope; naturalness must not strengthen a claim. Read every scene aloud once. If a sentence sounds like a subtitle translation, shorten it or split it before delivery.

Never write fabricated turn-taking such as “당신 말에 동의합니다”, “그 지적에 답하자면”, or “방금 말씀처럼” for the participants. If contrast is needed, have the moderator say that the recorded positions differ. Do not infer that a speaker changed their mind or saw another speaker's video unless the source explicitly establishes that fact.

