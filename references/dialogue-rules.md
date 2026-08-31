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

## From source metaphor to discussion concept

For each metaphorical or mixed anchor, create one `semantic_frames` entry with `source_image_terms` and `underlying_claim`. Include both image nouns and every image-bearing verb/adjective surface family; for example, record both `짐` and `덜어`. Render it in two distinct layers:

- `dialogue`: participant `faithful_paraphrase` or `multi_anchor_synthesis` text and moderator questions use concepts without the linked image terms;
- `evidence`: verified wording and any `direct_quote` may retain the source image;
- visual treatment may use `visual_hint`, but the visual never becomes evidence.

If the user requests dialogue without an evidence page, return only the dialogue layer. Before writing a moderator question, add a `semantic_connections` entry: classify the relationship as `sequence`, `complement`, or `conflict`, name one `shared_dimension`, and choose a compatible question mode. If the question is duplicated in `claims`, link it with `semantic_connection_id` and use identical text. Cross-domain bridge text is also moderator dialogue and is checked against the frames attached to its support anchors. The validator enforces the detailed contract in [source contract](source-contract.md).

For example, map `오를 산을 정한다` to `목표와 방향을 먼저 정한다`, and map `짐을 덜어낸다` to `하지 않을 일을 정해 집중한다`. Those claims normally form a sequence or complement: `목표를 먼저 분명히 한 뒤, 무엇을 하지 않을지 어떻게 정할까요?` Use an either/or question only when verified anchors establish a real conflict.

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

