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

`evidence_uses` is the render plan. It is optional for an evidence-map-only draft, but required before rendering a deck. Each evidence anchor normally appears in exactly one evidence slide, and each exact `video_id + start + end` clip is rendered once. If a deliberate reuse is unavoidable, set `reuse_allowed: true` and provide a short `reuse_reason`; otherwise `scripts/validate_manifest.mjs` rejects the manifest.

`lens` is independent of `direction`. Use `same-domain` by default or `cross-domain` when comparing different fields. A cross-domain manifest requires a `bridges` array. Each bridge is authored by `AI moderator`, cites at least two anchors from different sources, records confidence, and includes a visible `difference`. Never store cross-domain synthesis as a participant claim. Read [cross-domain bridges](cross-domain-bridges.md) for the contract and example.

## Required checks

- `sources.length >= 2`; each source has a valid YouTube video ID and stable URL.
- Resolve and store `channel_name` plus `channel_url` whenever YouTube metadata is available; show those fields as the primary human-facing citation. Keep the direct video `url` alongside them. If metadata cannot be verified, use `제공된 원본 링크` and never invent a channel or title.
- `start` and `end` are finite non-negative seconds with `end > start`.
- The timestamp URL contains the same video ID and a `t` value equal to `start`.
- Every participant claim has at least one support anchor. Moderator connective text may be unsupported only when it introduces no new factual premise.
- Every cross-domain bridge has evidence from at least two sources and remains separate from participant claims.
- `direct_quote` requires an exact transcript span and manual/original-audio review. Automatic captions are evidence for locating a passage, not final quotation copy.
- `faithful_paraphrase` has no quotation marks. `multi_anchor_synthesis` names all supporting anchor IDs.
- Record whether captions were auto-generated, human-created, or unavailable, and disclose that status in the deck.
- Before generation, validate every `evidence_uses` entry against its anchor's video ID and exact range. A later dialogue turn can cite an already-shown anchor in notes, but must not create a second player for it.

The anchor is a return point, not proof that every generated sentence was spoken verbatim. Keep the surrounding transcript context (usually 30–60 seconds) for review.

