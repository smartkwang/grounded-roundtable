# Grounded Roundtable v0.3 semantic frames design

## Status

Approved direction: replace prompt-only metaphor handling with a manifest-backed, validator-enforced semantic framing contract. This release is `v0.3.0` because it changes the evidence manifest interface. No `v0.2.1` release will be published.

## Problem

The current Korean editing pass can ask the model to turn source metaphors into concepts, but it cannot guarantee that the dialogue layer stays concept-level. In behavioral tests, the mountain/luggage example improved while an unrelated navigation/gardening example still leaked `가지치기` into a participant paraphrase. Repeated prose refinements therefore reached an architectural limit: generation and verification share no structured record of which words belong only to the source-image layer.

The failure is not ordinary translationese. It is a layer violation:

- source evidence may preserve a speaker's verified metaphor;
- visuals may reuse that image as a memory cue;
- synthetic dialogue must compare the underlying claims and their actual relationship;
- the validator currently sees only anchors and claim text, so it cannot enforce that separation.

## Alternatives considered

### Prompt-only guidance

Keep expanding the Korean naturalness instructions. This is cheap but was rejected because three wording iterations still produced a variation failure.

### Post-generation LLM review

Ask a second model to find mixed metaphors. This may improve average quality, but adds tokens and remains nondeterministic. It can be an optional editorial pass, not the correctness boundary.

### Structured semantic frames with deterministic validation

Record metaphor status, image terms, underlying claims, source relationships, and moderator question mode in the manifest. Validate the generated dialogue against those fields. This is the selected design because it converts a subjective reminder into inspectable data while adding little transcript-processing cost.

## Data contract

### Anchor classification

Every anchor adds a required `rhetorical_form` field:

- `literal`: the anchor states its claim without a controlling metaphor;
- `metaphorical`: the claim is primarily expressed through a source image;
- `mixed`: literal explanation and metaphor both carry meaning.

Every `metaphorical` or `mixed` anchor must have exactly one semantic frame. A `literal` anchor must not have one. Requiring the field prevents metaphor handling from being silently skipped. Existing manifests migrate by adding `rhetorical_form: "literal"` to ordinary anchors.

### Semantic frames

```json
{
  "semantic_frames": [
    {
      "frame_id": "F01",
      "anchor_id": "A01",
      "source_image_terms": ["산", "오를", "걷다"],
      "underlying_claim": "목표와 방향을 먼저 정해야 한다.",
      "visual_hint": "선택한 봉우리를 바라보는 장면"
    }
  ]
}
```

`source_image_terms` contains only words that belong to the metaphorical image, not legitimate concept words such as `목표`, `방향`, or `우선순위`. `visual_hint` is optional and never becomes evidence by itself.

### Dialogue claims

Claims supported by a metaphorical or mixed anchor add:

```json
{
  "layer": "dialogue",
  "semantic_frame_ids": ["F01"]
}
```

`layer` is `dialogue` or `evidence`. It defaults to `dialogue` only for claims supported exclusively by literal anchors, preserving the simplest existing case.

- `dialogue` contains moderator wording and participant `faithful_paraphrase` or `multi_anchor_synthesis` text. It must contain no source-image term from its linked frames.
- `evidence` may preserve verified source wording. A metaphorical `direct_quote` is valid only in this layer and continues to require transcript text plus original-audio review.

A claim supported by a metaphorical or mixed anchor must list its semantic frame ID. Unknown or unrelated frame references fail validation.

### Semantic connections

When a moderator connects two or more semantic frames, the manifest records the relationship before writing the question:

```json
{
  "semantic_connections": [
    {
      "connection_id": "SC01",
      "semantic_frame_ids": ["F01", "F02"],
      "relationship": "sequence",
      "shared_dimension": "목표 설정과 집중",
      "question_mode": "sequence",
      "moderator_question": "목표를 먼저 분명히 한 뒤, 불필요한 선택을 어떻게 덜어내야 할까요?"
    }
  ]
}
```

Relationships and allowed question modes are:

| Relationship | Allowed question modes |
|---|---|
| `sequence` | `sequence`, `integration` |
| `complement` | `integration`, `sequence` |
| `conflict` | `contrast`, `tradeoff`, `integration` |

Every connection cites at least two frames from different sources. The moderator question is scanned for source-image leakage. For `sequence` and `complement`, a narrow Korean heuristic also rejects unsupported forced-choice forms such as `아니면`, `중 무엇`, and `어느 쪽`.

`connection_id` must be unique. `shared_dimension` and `moderator_question` must be non-empty after trimming whitespace. Repeated frame IDs within one connection do not count toward the two-frame minimum.

## Deterministic text check

The validator normalizes Unicode with NFKC, lowercases Latin text, replaces punctuation with spaces, and tokenizes on whitespace. Before comparison, it removes at most one longest matching Korean particle suffix from each dialogue token. The initial suffix set is `으로부터`, `에게서`, `에서부터`, `까지는`, `부터는`, `이라는`, `라고는`, `으로`, `에게`, `에서`, `부터`, `까지`, `처럼`, `보다`, `이라`, `라고`, `에는`, `으로는`, `은`, `는`, `이`, `가`, `을`, `를`, `에`, `의`, `도`, `만`, `와`, `과`, `로`. The implementation may extend this list only with a unit test demonstrating that the added suffix does not create a false positive.

- One-character terms match normalized tokens exactly, which catches `산을` and `짐부터` without matching `생산` or `계산`.
- Terms of two or more characters match a normalized token prefix, which catches `가지치기하듯` from `가지치기` and `덜어내야` from the stable surface fragment `덜어`.

The validator reports the claim or connection ID, matched term, and frame ID. It does not rewrite text automatically. The workflow rewrites only the affected turn once, validates again, and stops with the remaining violations if the second attempt fails.

## Workflow changes

1. Classify each selected anchor as literal, metaphorical, or mixed.
2. Build semantic frames for every metaphorical or mixed anchor using only the verified transcript window.
3. Establish source relationships and shared decision dimensions before drafting moderator questions.
4. Generate separate dialogue and evidence layers.
5. Run manifest validation before rendering slides.
6. On a semantic violation, rewrite only the affected dialogue turn once and revalidate.
7. Keep verified source wording and metaphor imagery on the evidence or visual layer.

This adds small structured fields around selected anchors; it does not resend full transcripts or add another mandatory model pass.

## Files in scope

- `SKILL.md`: route metaphorical anchors through semantic frames and require validation.
- `references/source-contract.md`: document the new fields and migration.
- `references/dialogue-rules.md`: define the two-layer rendering contract.
- `references/korean-naturalness.md`: retain the editorial explanation and rejection checks.
- `scripts/validate_manifest.mjs`: validate frames, layers, connections, relationship modes, and source-image leakage.
- `tests/validate-manifest.test.mjs`: add deterministic unit cases.
- `tests/semantic-reframing-evaluation.md`: retain reusable fresh-context behavior scenarios and results.
- `examples/manifest.json`: migrate the public example.
- `CHANGELOG.md`: publish one `v0.3.0` entry and remove the unreleased `v0.2.1` entry.

README files, slide rendering code, YouTube ingestion, native-player behavior, and the existing visual palette are out of scope.

## Test strategy

Unit tests must cover:

- valid literal and metaphorical manifests;
- missing or invalid `rhetorical_form`;
- a metaphorical anchor with no frame or more than one frame;
- a frame with an unknown anchor or empty image terms;
- participant and moderator dialogue leaking short and long source-image terms;
- a verified evidence-layer direct quote retaining source wording;
- unknown or unrelated frame references;
- incompatible relationship and question modes;
- a non-conflict connection using a forced-choice marker;
- the existing bridge and evidence-player invariants.

Behavior evaluation uses fresh contexts and scores semantic invariants rather than exact wording. Before release, Case A runs five times and Case B runs at least twice. All dialogue-layer turns must pass; evidence-layer imagery may remain.

## Release and migration

The change releases as `v0.3.0`. Release notes show the one-field anchor migration and a complete semantic-frame example. The PR must pass the existing tests, new validator tests, skill quick validation, behavior evaluation, and an independent review before merge and tagging.

## Non-goals

- universal metaphor discovery from arbitrary full transcripts;
- a Korean morphological analyzer or third-party NLP dependency;
- banning all figurative Korean language;
- treating generated visuals as evidence;
- changing the deck design or YouTube player workflow;
- adding another mandatory full-transcript model call.
