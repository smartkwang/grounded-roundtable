# Semantic Frames v0.3 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Release a validator-enforced v0.3 manifest contract that keeps verified source metaphors on evidence/visual layers while requiring synthetic Korean dialogue to use the underlying concepts.

**Architecture:** Extend the existing single-file Node.js validator in three test-first increments: anchor/frame integrity, claim-layer leakage checks, then semantic-connection relationship checks. Migrate the public manifest and skill references only after the executable contract is green, so prose documents describe tested behavior rather than inventing a parallel rule set.

**Tech Stack:** Node.js ES modules and built-in `assert`, JSON manifests, Markdown skill/reference files, Git.

**Spec:** `docs/superpowers/specs/2026-08-31-semantic-frames-v0.3-design.md`

## Global Constraints

- Release version is `v0.3.0`; do not publish `v0.2.1`.
- Do not add a mandatory second full-transcript model pass or a third-party Korean NLP dependency.
- Preserve source imagery in evidence or visual layers; reject linked source-image terms in dialogue-layer participant text and moderator questions.
- `README.md` and `README.ko.md` are out of scope.
- Existing bridge and evidence-player validation must continue to pass.
- Rewrite only the affected turn once after a semantic violation; stop and report remaining violations after the second validation failure.

---

### Task 1: Anchor classification and semantic-frame integrity

**Files:**
- Modify: `tests/validate-manifest.test.mjs`
- Modify: `scripts/validate_manifest.mjs`

**Interfaces:**
- Consumes: existing `sources[].anchors[]` map keyed by `anchor_id`.
- Produces: `semanticFrames: Map<string, { frame, anchor, source }>` keyed by `frame_id`, a global `semanticFrameIds: Set<string>` for duplicate detection before owner resolution, and validator errors for invalid `rhetorical_form` and frame ownership.

- [ ] **Step 1: Make the existing fixture explicitly literal**

Add `rhetorical_form: 'literal'` to both anchors in `base`. This preserves the existing valid case under the new required-field contract.

- [ ] **Step 2: Add failing anchor/frame tests**

Add cases that use immutable object copies of `base` and assert these messages:

```js
expectInvalid('missing-rhetorical-form', manifestWithAnchor('A01', {
  rhetorical_form: undefined
}), /rhetorical_form must be literal, metaphorical, or mixed/);

expectInvalid('metaphorical-anchor-without-frame', manifestWithAnchor('A01', {
  rhetorical_form: 'metaphorical'
}), /metaphorical anchor A01 must have exactly one semantic frame/);

expectInvalid('literal-anchor-with-frame', {
  ...base,
  semantic_frames: [frame('F01', 'A01', ['산'], '목표를 먼저 정해야 한다.')]
}, /literal anchor A01 must not have a semantic frame/);

expectInvalid('duplicate-frame-id', metaphorManifest({
  semantic_frames: [
    frame('F01', 'A01', ['산'], '목표를 먼저 정해야 한다.'),
    frame('F01', 'A02', ['짐'], '불필요한 일을 줄여야 한다.')
  ]
}), /frame_id duplicates F01/);

expectInvalid('unknown-frame-anchor', {
  ...base,
  semantic_frames: [frame('F01', 'A99', ['산'], '목표를 먼저 정해야 한다.')]
}, /references unknown anchor A99/);

expectInvalid('empty-image-terms', metaphorManifest({
  semantic_frames: [frame('F01', 'A01', [], '목표를 먼저 정해야 한다.')]
}), /source_image_terms must contain at least one non-empty term/);
```

Define small test-only helpers `manifestWithAnchor`, `frame`, and `metaphorManifest` above the test block. They must clone nested sources/anchors rather than mutate `base`.

- [ ] **Step 3: Run the validator tests and confirm RED**

Run: `node tests/validate-manifest.test.mjs`

Expected: the new missing-`rhetorical_form` case passes incorrectly or the metaphor-frame cases fail with missing expected diagnostics, proving the executable contract is absent.

- [ ] **Step 4: Implement the minimal frame contract**

In `scripts/validate_manifest.mjs`:

```js
const rhetoricalForms = new Set(['literal', 'metaphorical', 'mixed']);
const anchorFrameCounts = new Map();
const semanticFrames = new Map();
const semanticFrameIds = new Set();
```

During source parsing, require unique non-empty `source_id` and unique YouTube `video_id`. During anchor parsing, reject values outside `rhetoricalForms`. Parse `data.semantic_frames` after anchors. Require a globally unique non-empty `frame_id` before owner resolution, an existing `anchor_id`, a non-empty string `underlying_claim`, and only non-empty strings in `source_image_terms`. Store valid references in `semanticFrames` and increment `anchorFrameCounts`. Then require exactly one frame for `metaphorical`/`mixed` anchors and zero frames for `literal` anchors.

- [ ] **Step 5: Run tests and confirm GREEN**

Run: `node tests/validate-manifest.test.mjs`

Expected: all old and new cases pass.

- [ ] **Step 6: Commit the executable frame contract**

```powershell
git add scripts/validate_manifest.mjs tests/validate-manifest.test.mjs
git commit -m "feat: validate semantic frame ownership"
```

---

### Task 2: Claim layers and deterministic metaphor-leak detection

**Files:**
- Modify: `tests/validate-manifest.test.mjs`
- Modify: `scripts/validate_manifest.mjs`

**Interfaces:**
- Consumes: Task 1 `semanticFrames` and existing `claims[]`.
- Produces: `rawTokens(text): string[]`, `stripKoreanParticle(token): string`, `findLeakedTerm(text, terms): string | null`, and layer/frame-reference validation errors.

- [ ] **Step 1: Add failing valid and invalid claim cases**

Add a valid metaphor manifest whose anchor A01 is `metaphorical`, frame F01 stores `['산', '오를']`, and dialogue claim C01 says `목표와 방향을 먼저 정해야 한다.` with `layer: 'dialogue'` and `semantic_frame_ids: ['F01']`.

Add these invalid cases:

```js
expectInvalid('metaphor-claim-without-frame-reference', metaphorBase(),
  /claim C01 must reference semantic frame F01/);

expectInvalid('unknown-claim-frame-reference', withClaimFrames(metaphorBase(), ['F99']),
  /references unknown semantic frame F99/);

expectInvalid('unrelated-claim-frame-reference', withClaimFrames(metaphorBase(), ['F02']),
  /semantic frame F02 is unrelated to its support anchors/);

expectInvalid('short-term-leak', withClaimText(metaphorBase(), '산을 먼저 정해야 한다.'),
  /claim C01 leaks source-image term "산" from frame F01/);

expectValid('short-term-no-substring-false-positive',
  withClaimText(metaphorBase(), '생산 목표를 먼저 정해야 한다.'));

expectInvalid('long-term-prefix-leak', gardeningManifest('가지치기하듯 선택지를 줄여야 한다.'),
  /leaks source-image term "가지치기"/);

expectValid('evidence-direct-quote-keeps-metaphor', evidenceQuoteManifest());
```

`evidenceQuoteManifest()` must use `layer: 'evidence'`, `label: 'direct_quote'`, a non-empty `transcript_span`, and the linked frame ID.

- [ ] **Step 2: Run tests and confirm RED**

Run: `node tests/validate-manifest.test.mjs`

Expected: dialogue leakage and unrelated frame references are accepted.

- [ ] **Step 3: Implement token normalization and matching**

Add constants and pure helpers near `videoId`:

```js
const koreanParticleSuffixes = [
  '에서부터', '으로부터', '에게서', '으로는', '까지는', '부터는', '이라는',
  '라고는', '으로', '에게', '에서', '부터', '까지', '처럼', '보다', '이라',
  '라고', '에는', '은', '는', '이', '가', '을', '를', '에', '의', '도',
  '만', '와', '과', '로'
].sort((a, b) => b.length - a.length);

function rawTokens(text) {
  return String(text || '').normalize('NFKC').toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim().split(/\s+/).filter(Boolean);
}

function stripKoreanParticle(token) {
  const suffix = koreanParticleSuffixes.find((item) =>
    token.length > item.length && token.endsWith(item));
  return suffix ? token.slice(0, -suffix.length) : token;
}

function findLeakedTerm(text, terms) {
  const tokens = rawTokens(text).flatMap((token) => {
    const stripped = stripKoreanParticle(token);
    return stripped === token ? [token] : [token, stripped];
  });
  for (const rawTerm of terms) {
    const term = rawTokens(rawTerm).join('');
    if (!term) continue;
    const leaked = term.length === 1
      ? tokens.some((token) => token === term)
      : tokens.some((token) => token.startsWith(term));
    if (leaked) return rawTerm.trim();
  }
  return null;
}
```

- [ ] **Step 4: Enforce claim layers and frame linkage**

For each claim, resolve its support anchors. When any supported anchor is `metaphorical` or `mixed`, require explicit `layer` and every corresponding frame ID. Reject unknown frame IDs and frames whose anchor is outside `support_anchor_ids`. Scan `claim.text` only when `layer === 'dialogue'`; evidence-layer claims retain verified imagery. Require `direct_quote` supported by a metaphorical/mixed anchor to use `layer: 'evidence'`.

- [ ] **Step 5: Run tests and confirm GREEN**

Run: `node tests/validate-manifest.test.mjs`

Expected: all cases pass, including `생산` and evidence-quote controls.

- [ ] **Step 6: Commit the claim-layer validator**

```powershell
git add scripts/validate_manifest.mjs tests/validate-manifest.test.mjs
git commit -m "feat: reject metaphor leakage in dialogue claims"
```

---

### Task 3: Semantic connections and unsupported forced-choice checks

**Files:**
- Modify: `tests/validate-manifest.test.mjs`
- Modify: `scripts/validate_manifest.mjs`

**Interfaces:**
- Consumes: Task 1 `semanticFrames`, Task 2 `findLeakedTerm`.
- Produces: validation for `semantic_connections[]` and moderator questions.

- [ ] **Step 1: Add failing connection tests**

Create a two-frame manifest with F01 from source E01 and F02 from E02, then cover:

```js
expectValid('valid-sequence-connection', connectionManifest({
  relationship: 'sequence',
  question_mode: 'sequence',
  moderator_question: '목표를 먼저 정한 뒤 불필요한 선택을 어떻게 줄일까요?'
}));

expectInvalid('duplicate-connection-id', duplicateConnectionManifest(),
  /connection_id duplicates SC01/);

expectInvalid('connection-needs-different-sources', sameSourceConnectionManifest(),
  /needs at least two semantic frames from different sources/);

expectInvalid('incompatible-question-mode', connectionManifest({
  relationship: 'sequence', question_mode: 'contrast'
}), /question_mode contrast is not allowed for relationship sequence/);

expectInvalid('moderator-metaphor-leak', connectionManifest({
  moderator_question: '산을 먼저 정할까요, 짐을 먼저 줄일까요?'
}), /connection SC01 leaks source-image term "산" from frame F01/);

expectInvalid('unsupported-forced-choice', connectionManifest({
  relationship: 'complement', question_mode: 'integration',
  moderator_question: '목표가 중요한가, 아니면 소거가 중요한가?'
}), /uses forced-choice marker "아니면" for non-conflict relationship complement/);
```

Also test empty `shared_dimension`, empty `moderator_question`, repeated frame IDs, unknown frame IDs, and a valid `conflict + tradeoff` question containing `어느 쪽`.

- [ ] **Step 2: Run tests and confirm RED**

Run: `node tests/validate-manifest.test.mjs`

Expected: missing/incompatible connection fields and moderator leakage are accepted.

- [ ] **Step 3: Implement connection validation**

Add:

```js
const allowedQuestionModes = {
  sequence: new Set(['sequence', 'integration']),
  complement: new Set(['integration', 'sequence']),
  conflict: new Set(['contrast', 'tradeoff', 'integration'])
};
const forcedChoiceMarkers = ['아니면', '중 무엇'];
```

For every connection, require a unique non-empty `connection_id`, non-empty `shared_dimension` and `moderator_question`, a known relationship, a compatible question mode, and at least two distinct known frames from different YouTube video IDs. Scan the moderator question against the union of referenced frame terms. For `sequence` and `complement`, use token boundaries to reject explicit `아니면`, `중 무엇`/`중에 무엇`, choice uses such as `어느 쪽인가요`, and paired `~인가요`; do not reject neutral `어느 쪽에도` or `아니면서` wording and do not apply the heuristic to `conflict`. A moderator question duplicated in `claims` must provide `semantic_connection_id` and exactly match the connection question when its support anchors resolve to at least two frames, or when it omits support anchors while multiple frames exist. Literal-only questions need no connection. Scan cross-domain bridge text against frames belonging to its support anchors.

- [ ] **Step 4: Run focused and full tests**

Run: `node tests/validate-manifest.test.mjs`

Expected: all connection cases and all prior cases pass.

- [ ] **Step 5: Commit semantic connections**

```powershell
git add scripts/validate_manifest.mjs tests/validate-manifest.test.mjs
git commit -m "feat: validate semantic dialogue connections"
```

---

### Task 4: Migrate the public manifest contract and example

**Files:**
- Modify: `references/source-contract.md`
- Modify: `examples/manifest.json`
- Modify: `tests/validate-manifest.test.mjs`

**Interfaces:**
- Consumes: the executable JSON contract from Tasks 1–3.
- Produces: a complete valid example that users and future agents can copy.

- [ ] **Step 1: Add a failing public-example test**

At the end of `tests/validate-manifest.test.mjs`, run the validator against `examples/manifest.json` and require exit status 0:

```js
const publicExample = spawnSync(process.execPath, [
  validator,
  fileURLToPath(new URL('../examples/manifest.json', import.meta.url))
], { encoding: 'utf8' });
assert.equal(publicExample.status, 0,
  `public example should pass:\n${publicExample.stderr}`);
```

- [ ] **Step 2: Run tests and confirm RED**

Run: `node tests/validate-manifest.test.mjs`

Expected: the current example fails because anchors lack `rhetorical_form`.

- [ ] **Step 3: Migrate `examples/manifest.json`**

Mark all three existing anchors `rhetorical_form: "literal"`; the source material in this example does not use controlling metaphors, so do not fabricate semantic frames or connections merely to showcase the feature.

- [ ] **Step 4: Document the contract with one compact example**

In `references/source-contract.md`, add:

- the required anchor classification rule;
- the `semantic_frames` schema and exact-one/none ownership invariant;
- claim `layer` and `semantic_frame_ids` rules;
- the `semantic_connections` schema and compatibility table;
- leakage and forced-choice validation behavior;
- migration instruction to add `rhetorical_form: "literal"` to ordinary anchors.

Keep the primary full manifest example readable by marking its anchor literal. Use one separate compact mountain/luggage JSON fragment to illustrate metaphor handling; do not add project history or user-intent narrative.

- [ ] **Step 5: Run tests and validate the example directly**

Run:

```powershell
node tests/validate-manifest.test.mjs
node scripts/validate_manifest.mjs examples/manifest.json
```

Expected: both commands exit 0.

- [ ] **Step 6: Commit contract migration**

```powershell
git add references/source-contract.md examples/manifest.json tests/validate-manifest.test.mjs
git commit -m "docs: publish semantic frame manifest contract"
```

---

### Task 5: Route the skill through the tested two-layer workflow

**Files:**
- Modify: `SKILL.md`
- Modify: `references/dialogue-rules.md`
- Modify: `references/korean-naturalness.md`
- Modify: `tests/semantic-reframing-evaluation.md`

**Interfaces:**
- Consumes: manifest contract and diagnostics from Tasks 1–4.
- Produces: concise agent instructions that build frames before dialogue, validate before slide rendering, and permit one affected-turn rewrite.

- [ ] **Step 1: Preserve the existing baseline evidence**

Update `tests/semantic-reframing-evaluation.md` so its result table distinguishes:

- released `v0.2.0` baseline: Case A `0/5` passes;
- prompt-only candidates: Case A `5/5`, Case B had at least one participant-image leak in later variation testing;
- final `v0.3.0`: initially `pending` until Task 7.

The fixture must retain the exact Case A and Case B prompts and the rule that every flagged output is manually reviewed.

- [ ] **Step 2: Rewrite `SKILL.md` routing concisely**

Replace prompt-only metaphor instructions with these required decisions:

1. Classify every selected anchor with `rhetorical_form`.
2. For metaphorical/mixed anchors, create one semantic frame from the verified transcript window and include every image noun plus image-bearing verb/adjective surface variant.
3. Establish semantic connections before drafting moderator questions.
4. Keep verified wording and source imagery on evidence/visual layers.
5. Generate dialogue from `underlying_claim` and `shared_dimension`.
6. Copy the exact final wording into a temporary manifest and run `node scripts/validate_manifest.mjs <manifest>` before slide rendering or dialogue-only delivery.
7. If validation reports leakage or forced-choice misuse, rewrite only the named turn once and revalidate; stop and report if still invalid.

Route detailed fields to `references/source-contract.md`, Korean editorial examples to `references/korean-naturalness.md`, and turn construction to `references/dialogue-rules.md`. Do not duplicate the full schema in `SKILL.md`.

- [ ] **Step 3: Align dialogue and Korean-naturalness references**

In `references/dialogue-rules.md`, define participant dialogue, moderator connection, evidence, and visual responsibilities. In `references/korean-naturalness.md`, keep natural Korean examples that turn imagery into decision concepts without inventing conflict. Explicitly distinguish:

- source image: `오를 산`, `짐`, `가지치기`;
- dialogue concepts: `목표 설정`, `불필요한 선택의 소거`, `우선순위 조정`;
- allowed relationship: sequence/complement unless sources actually conflict.

Remove redundant prompt-only rules superseded by the validator.

- [ ] **Step 4: Validate skill structure and references**

Run:

```powershell
$validator = 'C:\Users\lsg91\.codex\skills\.system\skill-creator\scripts\quick_validate.py'
python -X utf8 $validator .
rg -n "semantic_frames|semantic_connections|rhetorical_form|validate_manifest" SKILL.md references
```

Expected: quick validation succeeds; each contract term appears where routed and no referenced file is missing.

- [ ] **Step 5: Commit the skill guidance**

```powershell
git add SKILL.md references/dialogue-rules.md references/korean-naturalness.md tests/semantic-reframing-evaluation.md
git commit -m "feat: route dialogue through semantic frames"
```

---

### Task 6: Version, changelog, and installed-skill synchronization

**Files:**
- Modify: `CHANGELOG.md`
- Copy modified skill files to: `C:\Users\lsg91\.codex\skills\grounded-roundtable\`

**Interfaces:**
- Consumes: green repository state from Tasks 1–5.
- Produces: one unreleased `v0.3.0` changelog entry and an identical locally installed candidate for behavioral testing.

- [ ] **Step 1: Replace the unreleased v0.2.1 note**

Write one `v0.3.0` entry describing the breaking manifest migration, deterministic source-image leakage checks, relationship-aware moderator questions, and the one-field literal-anchor migration. Do not add personal project history or repeat README content.

- [ ] **Step 2: Verify changelog version consistency**

Run:

```powershell
rg -n "v0\.2\.1|v0\.3\.0" CHANGELOG.md docs/superpowers/specs docs/superpowers/plans
```

Expected: `CHANGELOG.md` contains `v0.3.0` and no release entry for `v0.2.1`; design/plan may mention that v0.2.1 was intentionally skipped.

- [ ] **Step 3: Synchronize the installed candidate**

Copy only the runtime skill files (`SKILL.md`, `references/`, `scripts/`, and relevant example) from the repository to `C:\Users\lsg91\.codex\skills\grounded-roundtable\`. Preserve unrelated local files and verify hashes for every copied file.

- [ ] **Step 4: Commit release metadata**

```powershell
git add CHANGELOG.md
git commit -m "chore: prepare v0.3.0 release notes"
```

---

### Task 7: Full verification, behavior evaluation, review, and GitHub release

**Files:**
- Modify: `tests/semantic-reframing-evaluation.md`
- No README changes.

**Interfaces:**
- Consumes: repository and installed candidate from Tasks 1–6.
- Produces: reproducible verification evidence, review-ready branch, PR, merge, and `v0.3.0` tag/release.

- [ ] **Step 1: Run the complete deterministic suite**

Run:

```powershell
node tests/validate-manifest.test.mjs
node scripts/validate_manifest.mjs examples/manifest.json
node --check scripts/validate_native_structure.mjs
python -X utf8 'C:\Users\lsg91\.codex\skills\.system\skill-creator\scripts\quick_validate.py' .
git diff --check
```

Expected: every command exits 0 with no validation errors.

- [ ] **Step 2: Run fresh-context behavioral evaluation**

Use the installed `grounded-roundtable` candidate with the exact prompts in `tests/semantic-reframing-evaluation.md`:

- Case A: five independent runs;
- Case B: at least two independent runs.

Manually inspect every participant and moderator turn. A run passes only if dialogue uses concepts, evidence retains source imagery, the relationship is not falsely forced into conflict, and no invented participant position appears.

- [ ] **Step 3: Record behavior results**

Replace the `v0.3.0 pending` row with run count, pass count, failure excerpts if any, and the commit hash tested. If any run fails, add a focused failing validator or guidance test before changing implementation, then repeat the affected evaluation set.

- [ ] **Step 4: Request independent code and skill review**

Review the branch diff against the v0.3 design for correctness, backward migration clarity, false positives in Korean matching, and scope control. Resolve only evidence-backed findings and rerun Step 1.

- [ ] **Step 5: Commit evaluation evidence**

```powershell
git add tests/semantic-reframing-evaluation.md
git commit -m "test: record semantic framing evaluation"
```

- [ ] **Step 6: Push and open the GitHub PR**

Rename the branch to `codex/semantic-frames-v0.3` if necessary, push it, and open a PR that links the design, lists the breaking manifest migration, and reports deterministic plus behavioral test results. Do not merge unless checks and review are green.

- [ ] **Step 7: Merge and release**

After the PR merges, update local `main`, create annotated tag `v0.3.0` on the merge commit, push the tag, and publish GitHub release notes derived from `CHANGELOG.md`. Verify the release URL and tag target before reporting completion.
