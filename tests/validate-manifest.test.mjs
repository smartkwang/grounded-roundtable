#!/usr/bin/env node
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const validator = fileURLToPath(new URL('../scripts/validate_manifest.mjs', import.meta.url));
const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'grounded-roundtable-'));

const base = {
  topic: '서로 다른 분야의 숙련은 어떻게 닮고 다른가',
  lens: 'cross-domain',
  direction: 'tension-first',
  sources: [
    {
      source_id: 'E01',
      speaker: 'Chef A',
      video_id: 'chef001',
      url: 'https://youtu.be/chef001',
      anchors: [{
        anchor_id: 'A01',
        rhetorical_form: 'literal',
        start: 10,
        end: 30,
        timestamp_url: 'https://youtu.be/chef001?t=10'
      }]
    },
    {
      source_id: 'E02',
      speaker: 'Engineer B',
      video_id: 'code002',
      url: 'https://youtu.be/code002',
      anchors: [{
        anchor_id: 'A02',
        rhetorical_form: 'literal',
        start: 40,
        end: 60,
        timestamp_url: 'https://youtu.be/code002?t=40'
      }]
    }
  ],
  claims: [
    { claim_id: 'C01', speaker: 'Chef A', label: 'faithful_paraphrase', text: '덜어내야 핵심이 선명해진다.', support_anchor_ids: ['A01'] },
    { claim_id: 'C02', speaker: 'Engineer B', label: 'faithful_paraphrase', text: '복잡성을 줄여야 유지하기 쉬워진다.', support_anchor_ids: ['A02'] }
  ],
  bridges: [{
    bridge_id: 'B01',
    author: 'AI moderator',
    label: 'cross_domain_hypothesis',
    meta_theme: 'simplification',
    text: '두 발언은 불필요한 것을 덜어내 핵심을 선명하게 만든다는 원리로 연결해 볼 수 있다.',
    support_anchor_ids: ['A01', 'A02'],
    confidence: 'tentative',
    difference: '요리는 감각적 결과를, 소프트웨어는 유지보수성을 판단 기준으로 삼는다.'
  }]
};

function manifestWithAnchor(anchorId, changes) {
  const manifest = structuredClone(base);
  for (const source of manifest.sources) {
    source.anchors = source.anchors.map((anchor) => (
      anchor.anchor_id === anchorId ? { ...anchor, ...changes } : anchor
    ));
  }
  return manifest;
}

function frame(frameId, anchorId, sourceImageTerms, underlyingClaim) {
  return {
    frame_id: frameId,
    anchor_id: anchorId,
    source_image_terms: sourceImageTerms,
    underlying_claim: underlyingClaim
  };
}

function metaphorManifest(changes = {}) {
  return {
    ...manifestWithAnchor('A01', { rhetorical_form: 'metaphorical' }),
    semantic_frames: [frame('F01', 'A01', ['산'], '목표를 먼저 정해야 한다.')],
    ...changes
  };
}

function metaphorBase() {
  const manifest = metaphorManifest();
  manifest.claims = manifest.claims.map((claim) => (
    claim.claim_id === 'C01'
      ? {
          ...claim,
          text: '목표와 방향을 먼저 정해야 한다.',
          layer: 'dialogue',
          semantic_frame_ids: ['F01']
        }
      : claim
  ));
  return manifest;
}

function withClaimChanges(manifest, changes) {
  const result = structuredClone(manifest);
  result.claims = result.claims.map((claim) => (
    claim.claim_id === 'C01' ? { ...claim, ...changes } : claim
  ));
  return result;
}

function gardeningManifest(text) {
  const manifest = metaphorBase();
  manifest.semantic_frames[0] = frame(
    'F01',
    'A01',
    ['가지치기'],
    '불필요한 선택지를 줄여 핵심에 집중해야 한다.'
  );
  return withClaimChanges(manifest, { text });
}

function evidenceQuoteManifest() {
  return withClaimChanges(metaphorBase(), {
    label: 'direct_quote',
    text: '오를 산을 먼저 정해야 한다.',
    layer: 'evidence',
    transcript_span: 'Decide which mountain you want to climb first.'
  });
}

function connectionManifest(changes = {}) {
  const manifest = metaphorBase();
  manifest.sources[1].anchors[0].rhetorical_form = 'metaphorical';
  manifest.semantic_frames.push(frame(
    'F02',
    'A02',
    ['짐'],
    '불필요한 선택을 줄여 핵심에 집중해야 한다.'
  ));
  manifest.claims = manifest.claims.map((claim) => (
    claim.claim_id === 'C02'
      ? {
          ...claim,
          text: '불필요한 선택을 줄여 핵심에 집중해야 한다.',
          layer: 'dialogue',
          semantic_frame_ids: ['F02']
        }
      : claim
  ));
  manifest.semantic_connections = [{
    connection_id: 'SC01',
    semantic_frame_ids: ['F01', 'F02'],
    relationship: 'sequence',
    shared_dimension: '목표 설정과 집중',
    question_mode: 'sequence',
    moderator_question: '목표를 먼저 정한 뒤 불필요한 선택을 어떻게 줄일까요?',
    ...changes
  }];
  return manifest;
}

function duplicateConnectionManifest() {
  const manifest = connectionManifest();
  manifest.semantic_connections.push({ ...manifest.semantic_connections[0] });
  return manifest;
}

function sameSourceConnectionManifest() {
  const manifest = connectionManifest();
  manifest.sources[0].anchors.push({
    anchor_id: 'A03',
    rhetorical_form: 'metaphorical',
    start: 70,
    end: 90,
    timestamp_url: 'https://youtu.be/chef001?t=70'
  });
  manifest.semantic_frames.push(frame(
    'F03',
    'A03',
    ['불꽃'],
    '초기의 추진력을 확보해야 한다.'
  ));
  manifest.semantic_connections[0].semantic_frame_ids = ['F01', 'F03'];
  return manifest;
}

function validate(name, manifest) {
  const file = path.join(tempDir, `${name}.json`);
  fs.writeFileSync(file, JSON.stringify(manifest), 'utf8');
  return spawnSync(process.execPath, [validator, file], { encoding: 'utf8' });
}

function expectValid(name, manifest) {
  const result = validate(name, manifest);
  assert.equal(result.status, 0, `${name} should pass:\n${result.stderr}`);
}

function expectInvalid(name, manifest, message) {
  const result = validate(name, manifest);
  assert.notEqual(result.status, 0, `${name} should fail validation`);
  assert.match(result.stderr, message);
}

try {
  expectValid('valid-cross-domain-bridge', base);

  expectInvalid('missing-source-id', {
    ...base,
    sources: [{ ...base.sources[0], source_id: undefined }, base.sources[1]]
  }, /source_id is required/);

  const duplicateVideoSource = structuredClone(base);
  duplicateVideoSource.sources[1].video_id = 'chef001';
  duplicateVideoSource.sources[1].url = 'https://youtu.be/chef001';
  duplicateVideoSource.sources[1].anchors[0].timestamp_url = 'https://youtu.be/chef001?t=40';
  expectInvalid(
    'duplicate-video-source',
    duplicateVideoSource,
    /video_id duplicates chef001; each source must be a different YouTube video/
  );

  expectInvalid('participant-attribution', {
    ...base,
    bridges: [{ ...base.bridges[0], author: 'Chef A' }]
  }, /author must be AI moderator/);

  expectInvalid('missing-cross-domain-bridge', {
    ...base,
    bridges: []
  }, /cross-domain lens requires at least one bridge/);

  expectInvalid('single-source-bridge', {
    ...base,
    bridges: [{ ...base.bridges[0], support_anchor_ids: ['A01'] }]
  }, /at least two anchors from different sources/);

  expectInvalid('missing-difference', {
    ...base,
    bridges: [{ ...base.bridges[0], difference: '' }]
  }, /difference is required/);

  expectInvalid('cross-domain-label-on-speaker-claim', {
    ...base,
    claims: [{ ...base.claims[0], label: 'cross_domain_analogy' }]
  }, /cross-domain synthesis belongs in bridges/);

  expectInvalid('missing-rhetorical-form', manifestWithAnchor('A01', {
    rhetorical_form: undefined
  }), /rhetorical_form must be literal, metaphorical, or mixed/);

  expectInvalid('invalid-rhetorical-form', manifestWithAnchor('A01', {
    rhetorical_form: 'figurative'
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

  expectInvalid('duplicate-frame-id-after-invalid-owner', metaphorManifest({
    semantic_frames: [
      frame('F01', 'A99', ['산'], '목표를 먼저 정해야 한다.'),
      frame('F01', 'A01', ['산'], '목표를 먼저 정해야 한다.')
    ]
  }), /frame_id duplicates F01/);

  expectInvalid('metaphorical-anchor-with-two-frames', metaphorManifest({
    semantic_frames: [
      frame('F01', 'A01', ['산'], '목표를 먼저 정해야 한다.'),
      frame('F02', 'A01', ['걸어'], '방향 없는 속도는 성과로 이어지기 어렵다.')
    ]
  }), /metaphorical anchor A01 must have exactly one semantic frame/);

  expectInvalid('unknown-frame-anchor', {
    ...base,
    semantic_frames: [frame('F01', 'A99', ['산'], '목표를 먼저 정해야 한다.')]
  }, /references unknown anchor A99/);

  expectInvalid('empty-image-terms', metaphorManifest({
    semantic_frames: [frame('F01', 'A01', [], '목표를 먼저 정해야 한다.')]
  }), /source_image_terms must contain at least one non-empty term/);

  expectInvalid('invalid-image-term-type', metaphorManifest({
    semantic_frames: [frame('F01', 'A01', ['산', 123, ''], '목표를 먼저 정해야 한다.')]
  }), /source_image_terms must contain only non-empty strings/);

  expectInvalid('invalid-frame-id-type', metaphorManifest({
    semantic_frames: [{
      ...frame('F01', 'A01', ['산'], '목표를 먼저 정해야 한다.'),
      frame_id: 101
    }]
  }), /frame_id must be a non-empty string/);

  expectInvalid('invalid-underlying-claim-type', metaphorManifest({
    semantic_frames: [frame('F01', 'A01', ['산'], { text: '목표를 먼저 정해야 한다.' })]
  }), /underlying_claim must be a non-empty string/);

  expectValid('valid-metaphor-dialogue-claim', metaphorBase());

  expectInvalid('metaphor-claim-without-frame-reference', withClaimChanges(
    metaphorBase(),
    { semantic_frame_ids: undefined }
  ), /claim C01 must reference semantic frame F01/);

  expectInvalid('unknown-claim-frame-reference', withClaimChanges(
    metaphorBase(),
    { semantic_frame_ids: ['F99'] }
  ), /references unknown semantic frame F99/);

  const unrelatedFrameManifest = metaphorBase();
  unrelatedFrameManifest.sources[1].anchors[0].rhetorical_form = 'metaphorical';
  unrelatedFrameManifest.semantic_frames.push(frame(
    'F02',
    'A02',
    ['짐'],
    '불필요한 일을 줄여야 한다.'
  ));
  expectInvalid('unrelated-claim-frame-reference', withClaimChanges(
    unrelatedFrameManifest,
    { semantic_frame_ids: ['F02'] }
  ), /semantic frame F02 is unrelated to its support anchors/);

  expectInvalid('short-term-leak', withClaimChanges(
    metaphorBase(),
    { text: '산을 먼저 정해야 한다.' }
  ), /claim C01 leaks source-image term "산" from frame F01/);

  expectValid('short-term-no-substring-false-positive', withClaimChanges(
    metaphorBase(),
    { text: '생산 목표를 먼저 정해야 한다.' }
  ));

  expectInvalid(
    'long-term-prefix-leak',
    gardeningManifest('가지치기하듯 선택지를 줄여야 한다.'),
    /claim C01 leaks source-image term "가지치기" from frame F01/
  );

  const inflectedVerbLeak = metaphorBase();
  inflectedVerbLeak.semantic_frames[0] = frame(
    'F01',
    'A01',
    ['덜어'],
    '불필요한 선택을 줄여 핵심에 집중해야 한다.'
  );
  expectInvalid(
    'two-syllable-surface-prefix-leak',
    withClaimChanges(inflectedVerbLeak, { text: '불필요한 선택을 덜어내야 한다.' }),
    /claim C01 leaks source-image term "덜어" from frame F01/
  );

  const futureAdnominalTerm = metaphorBase();
  futureAdnominalTerm.semantic_frames[0] = frame(
    'F01',
    'A01',
    ['오를'],
    '목표와 방향을 먼저 정해야 한다.'
  );
  expectValid(
    'source-term-ending-is-not-stripped-as-particle',
    withClaimChanges(futureAdnominalTerm, { text: '오, 목표부터 분명히 해야 합니다.' })
  );
  expectInvalid(
    'source-term-ending-still-matches-raw-dialogue-token',
    withClaimChanges(futureAdnominalTerm, { text: '오를 곳을 먼저 정해야 합니다.' }),
    /claim C01 leaks source-image term "오를" from frame F01/
  );

  const irregularSurfaceVariant = metaphorBase();
  irregularSurfaceVariant.semantic_frames[0] = frame(
    'F01',
    'A01',
    ['걷다', '걸어'],
    '목표와 방향을 먼저 정해야 한다.'
  );
  expectInvalid(
    'irregular-surface-variant-leak',
    withClaimChanges(irregularSurfaceVariant, { text: '어디로 걸어갈지 먼저 정해야 합니다.' }),
    /claim C01 leaks source-image term "걸어" from frame F01/
  );

  expectValid('evidence-direct-quote-keeps-metaphor', evidenceQuoteManifest());

  expectValid('valid-sequence-connection', connectionManifest());

  expectInvalid(
    'duplicate-connection-id',
    duplicateConnectionManifest(),
    /connection_id duplicates SC01/
  );

  expectInvalid(
    'connection-needs-different-sources',
    sameSourceConnectionManifest(),
    /needs at least two semantic frames from different sources/
  );

  expectInvalid('incompatible-question-mode', connectionManifest({
    relationship: 'sequence',
    question_mode: 'contrast'
  }), /question_mode contrast is not allowed for relationship sequence/);

  expectInvalid('moderator-metaphor-leak', connectionManifest({
    moderator_question: '산을 먼저 정할까요, 짐을 먼저 줄일까요?'
  }), /connection SC01 leaks source-image term "산" from frame F01/);

  expectInvalid('unsupported-forced-choice', connectionManifest({
    relationship: 'complement',
    question_mode: 'integration',
    moderator_question: '목표가 중요한가, 아니면 소거가 중요한가?'
  }), /uses forced-choice marker "아니면" for non-conflict relationship complement/);

  expectInvalid('paired-question-forced-choice', connectionManifest({
    moderator_question: '목표가 먼저인가요, 집중이 먼저인가요?'
  }), /uses forced-choice marker "paired ~인가요" for non-conflict relationship sequence/);

  expectInvalid('choice-use-of-either-side', connectionManifest({
    moderator_question: '어느 쪽이 더 중요한가요?'
  }), /uses forced-choice marker "어느 쪽" for non-conflict relationship sequence/);

  expectValid('non-choice-either-side-phrase', connectionManifest({
    relationship: 'complement',
    question_mode: 'integration',
    moderator_question: '어느 쪽에도 치우치지 않으려면 어떻게 해야 할까요?'
  }));

  expectInvalid('empty-shared-dimension', connectionManifest({
    shared_dimension: ' '
  }), /shared_dimension is required/);

  expectInvalid('empty-moderator-question', connectionManifest({
    moderator_question: ' '
  }), /moderator_question is required/);

  expectInvalid('repeated-connection-frame', connectionManifest({
    semantic_frame_ids: ['F01', 'F01']
  }), /repeats semantic frame F01/);

  expectInvalid('unknown-connection-frame', connectionManifest({
    semantic_frame_ids: ['F01', 'F99']
  }), /references unknown semantic frame F99/);

  expectValid('valid-conflict-forced-choice', connectionManifest({
    relationship: 'conflict',
    question_mode: 'tradeoff',
    moderator_question: '어느 쪽의 위험을 먼저 감수해야 할까요?'
  }));

  const bridgeLeak = connectionManifest();
  bridgeLeak.bridges[0].text = '한쪽은 산을 정하고 다른 쪽은 짐을 줄인다는 원리로 연결된다.';
  expectInvalid(
    'cross-domain-bridge-metaphor-leak',
    bridgeLeak,
    /bridge B01 leaks source-image term "산" from frame F01/
  );

  const moderatorBypass = connectionManifest();
  moderatorBypass.semantic_connections = [];
  moderatorBypass.claims.push({
    claim_id: 'M01',
    speaker: 'moderator',
    label: 'moderator_question',
    text: '목표가 먼저인가요, 집중이 먼저인가요?'
  });
  expectInvalid(
    'moderator-question-requires-connection',
    moderatorBypass,
    /moderator claim M01 requires semantic_connection_id/
  );

  const linkedModerator = connectionManifest();
  linkedModerator.claims.push({
    claim_id: 'M01',
    speaker: 'moderator',
    label: 'moderator_question',
    text: linkedModerator.semantic_connections[0].moderator_question,
    semantic_connection_id: 'SC01'
  });
  expectValid('moderator-question-linked-to-connection', linkedModerator);

  expectInvalid('moderator-question-must-match-connection', {
    ...linkedModerator,
    claims: linkedModerator.claims.map((claim) => (
      claim.claim_id === 'M01' ? { ...claim, text: '다른 질문입니까?' } : claim
    ))
  }, /moderator claim M01 text must match connection SC01 moderator_question/);

  const publicExample = spawnSync(process.execPath, [
    validator,
    fileURLToPath(new URL('../examples/manifest.json', import.meta.url))
  ], { encoding: 'utf8' });
  assert.equal(
    publicExample.status,
    0,
    `public example should pass:\n${publicExample.stderr}`
  );

  console.log('Manifest validator tests passed: 51 cases.');
} finally {
  fs.rmSync(tempDir, { recursive: true, force: true });
}

