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

  console.log('Manifest validator tests passed: 6 cases.');
} finally {
  fs.rmSync(tempDir, { recursive: true, force: true });
}

