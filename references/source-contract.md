# Source contract

Use a small, inspectable manifest as the boundary between retrieval and generation. JSON is recommended:

```json
{
  "topic": "AI safety and public accountability",
  "lens": "same-domain",
  "direction": "tension-first",
  "audience": "people deciding whether and how to adopt AI",
  "takeaway": "Make the trade-off explicit before choosing an action.",
  "sources": [
    {
      "source_id": "E01",
      "speaker": "Bill Gates",
      "video_id": "abc123",
      "url": "https://youtu.be/abc123",
      "channel_name": "Verified YouTube channel name",
      "channel_url": "https://www.youtube.com/@verified-channel",
      "video_title": "Verified video title",
      "transcript_status": "auto_generated",
      "anchors": [
        {
          "anchor_id": "A01",
          "rhetorical_form": "literal",
          "start": 1207,
          "end": 1229,
          "timestamp_url": "https://youtu.be/abc123?t=1207",
          "transcript_span": "...",
          "confidence": "reviewed"
        }
      ]
    }
  ],
  "claims": [
    {
      "claim_id": "C01",
      "speaker": "Bill Gates",
      "label": "faithful_paraphrase",
      "text": "...",
      "support_anchor_ids": ["A01"]
    }
  ],
  "evidence_uses": [
    {
      "slide_id": "p4",
      "anchor_id": "A01",
      "video_id": "abc123",
      "start": 1207,
      "end": 1229
    }
  ]
}
```

## Semantic framing contract

Every anchor declares `rhetorical_form` as `literal`, `metaphorical`, or `mixed`. A metaphorical or mixed anchor owns exactly one entry in `semantic_frames`; a literal anchor owns none. When migrating an ordinary existing manifest, add `"rhetorical_form": "literal"` unless a verified transcript window actually uses a controlling source image.

Keep the source image and the discussion concept in separate fields:

```json
{
  "semantic_frames": [
    {
      "frame_id": "F01",
      "anchor_id": "A01",
      "source_image_terms": ["산", "오를"],
      "underlying_claim": "목표와 방향을 먼저 정해야 한다.",
      "visual_hint": "선택한 봉우리를 바라보는 장면"
    },
    {
      "frame_id": "F02",
      "anchor_id": "A02",
      "source_image_terms": ["짐", "덜다"],
      "underlying_claim": "불필요한 선택을 줄여 핵심에 집중해야 한다."
    }
  ],
  "claims": [
    {
      "claim_id": "C01",
      "speaker": "발표자 A",
      "label": "faithful_paraphrase",
      "layer": "dialogue",
      "text": "목표와 방향을 먼저 분명히 해야 합니다.",
      "support_anchor_ids": ["A01"],
      "semantic_frame_ids": ["F01"]
    }
  ],
  "semantic_connections": [
    {
      "connection_id": "SC01",
      "semantic_frame_ids": ["F01", "F02"],
      "relationship": "sequence",
      "shared_dimension": "목표 설정과 집중",
      "question_mode": "sequence",
      "moderator_question": "목표를 먼저 분명히 한 뒤, 불필요한 선택을 어떻게 줄일까요?"
    }
  ]
}
```

`source_image_terms` contains image-specific words only. Do not include valid discussion concepts such as `목표`, `방향`, or `우선순위`. `visual_hint` is optional and is never evidence.

Claims backed by a metaphorical or mixed anchor must set `layer` and list the corresponding `semantic_frame_ids`:

- `dialogue`: participant paraphrases and moderator wording. Linked source-image terms are rejected.
- `evidence`: verified source wording. A metaphorical `direct_quote` is valid only here and still requires `transcript_span` plus original-audio review.

Literal-only claims may omit `layer`; the validator treats that simple case as dialogue. A frame reference must exist and its anchor must appear in the claim's `support_anchor_ids`.

Every `semantic_connections` entry cites at least two distinct frames from different sources. Relationship and question mode must agree:

| Relationship | Allowed question modes |
|---|---|
| `sequence` | `sequence`, `integration` |
| `complement` | `integration`, `sequence` |
| `conflict` | `contrast`, `tradeoff`, `integration` |

The validator scans moderator questions for all referenced source-image terms. For `sequence` and `complement`, it also rejects forced-choice markers such as `아니면`, `중 무엇`, and `어느 쪽`; those forms are permitted only when the verified relationship is `conflict`.

`evidence_uses` is the render plan. It is optional for an evidence-map-only draft, but required before rendering a deck. Each evidence anchor normally appears in exactly one evidence slide, and each exact `video_id + start + end` clip is rendered once. If a deliberate reuse is unavoidable, set `reuse_allowed: true` and provide a short `reuse_reason`; otherwise `scripts/validate_manifest.mjs` rejects the manifest.

`lens` is independent of `direction`. Use `same-domain` by default or `cross-domain` when comparing different fields. A cross-domain manifest requires a `bridges` array. Each bridge is authored by `AI moderator`, cites at least two anchors from different sources, records confidence, and includes a visible `difference`. Never store cross-domain synthesis as a participant claim. Read [cross-domain bridges](cross-domain-bridges.md) for the contract and example.

## Required checks

- `sources.length >= 2`; each source has a valid YouTube video ID and stable URL.
- Every anchor declares `rhetorical_form`; metaphorical and mixed anchors own exactly one valid semantic frame, while literal anchors own none.
- Resolve and store `channel_name` plus `channel_url` whenever YouTube metadata is available; show those fields as the primary human-facing citation. Keep the direct video `url` alongside them. If metadata cannot be verified, use `제공된 원본 링크` and never invent a channel or title.
- `start` and `end` are finite non-negative seconds with `end > start`.
- The timestamp URL contains the same video ID and a `t` value equal to `start`.
- Every participant claim has at least one support anchor. Moderator connective text may be unsupported only when it introduces no new factual premise.
- Dialogue claims linked to semantic frames contain no `source_image_terms`; evidence claims may preserve verified source language.
- Every semantic connection uses compatible relationship and question modes, cites frames from at least two sources, and avoids unsupported forced-choice wording.
- Every cross-domain bridge has evidence from at least two sources and remains separate from participant claims.
- `direct_quote` requires an exact transcript span and manual/original-audio review. Automatic captions are evidence for locating a passage, not final quotation copy.
- `faithful_paraphrase` has no quotation marks. `multi_anchor_synthesis` names all supporting anchor IDs.
- Record whether captions were auto-generated, human-created, or unavailable, and disclose that status in the deck.
- Before generation, validate every `evidence_uses` entry against its anchor's video ID and exact range. A later dialogue turn can cite an already-shown anchor in notes, but must not create a second player for it.

The anchor is a return point, not proof that every generated sentence was spoken verbatim. Keep the surrounding transcript context (usually 30–60 seconds) for review.

