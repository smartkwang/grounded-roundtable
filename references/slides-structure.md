# Slides structure

The deck is a scene-centered thinking canvas, not a tutorial about the tool. Visible copy is for the audience; process notes, token budgets, and verification commentary belong in speaker notes. Use a compact 8–10-slide default and preserve this order:

1. Minimal cover with the selected direction and persistent virtual-disclosure label.
2–3. Long-form scene 1 (split only for readability).
4. Scene 1 evidence anchors with clickable timestamp links or permitted video players.
5. Long-form scene 2.
6. Scene 2 evidence anchors.
7. Long-form scene 3.
8. Scene 3 evidence anchors.
9. Open ending. Show a next-direction choice only as a compact line when useful.

The direction is a generation input, not an excuse for a full instruction slide. Add a separate direction picker only when the user explicitly asks the audience to choose inside the deck.

### Cross-domain bridge unit

When `lens` is `cross-domain`, preserve the evidence rhythm: field A claim → field A player → field B claim → field B player → AI moderator bridge → practice difference → audience question. Show the bridge as an AI hypothesis, not participant speech. Put the shared principle and the consequential difference in separate visual regions so the deck does not collapse distinct fields into a generic lesson. Do not repeat either evidence player after the bridge.

For shorter inputs, merge scene pages but do not revert to a clip after every sentence. Evidence pages should contain two to four high-value anchors, the speaker, timestamp range, one-line claim, and a direct link. When the output is native Google Slides, put a YouTube video element on the same evidence card using the original Video ID, set its `videoProperties.start`/`end` to the anchor range, and keep the exact timestamp link beside it as an external/open-in-YouTube fallback. A thumbnail is a navigation aid; it is not evidence by itself.

### Evidence-focus mode

When the user wants a longer, speaker-first rhythm, switch from multi-card evidence pages to a two-slide unit: one concise speaker-claim slide, then one evidence slide with a single full-size native YouTube player. Set that player's `start` and `end` to the anchor range. Remove PPTX placeholder overlays and decorative play buttons after native video insertion; the player itself supplies the playback affordance.

### Native-video replacement transaction

Treat native insertion as idempotent. Before writing, read the target evidence slide and record its designated media slot. For each slot, the post-write invariant is exactly one `YOUTUBE` video element, zero fallback image elements, and one unique clip key (`video_id + start + end`). If a native video already occupies the slot, update that object and its `videoProperties`; do not call `createVideo` again. If a PPTX thumbnail occupies the slot, delete that exact image object before creating the video. After the batch update, read the presentation back and run `scripts/validate_native_structure.mjs` (or an equivalent structural check) before delivery. Reject any out-of-bounds or overlapping video rectangles.

Use a visually distinct system for source evidence and synthetic dialogue. The default palette is a charcoal/navy background with white body copy and yellow titles, key phrases, rules, and links; never make the slide or a large panel yellow. Keep titles roughly 40–54 pt and body copy roughly 20–30 pt in a 16:9 deck, with generous negative space. Repeat a short disclosure on every slide. On each evidence slide, show a compact source block beside the player: YouTube channel name linked to the channel URL, original video link, speaker, Video ID, exact clip range, and caption/source status. If title or channel metadata is unverified, write `제공된 원본 링크` instead of inventing it. Add a `[Sources]` notes block to each slide so an imported native Google Slides deck retains machine-readable provenance.

