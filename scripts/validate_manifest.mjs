#!/usr/bin/env node
import fs from 'node:fs';

const file = process.argv[2];
if (!file) {
  console.error('Usage: node validate_manifest.mjs <manifest.json>');
  process.exit(2);
}

let data;
try {
  data = JSON.parse(fs.readFileSync(file, 'utf8'));
} catch (error) {
  console.error(`Cannot read JSON manifest: ${error.message}`);
  process.exit(2);
}

const errors = [];
const lens = data.lens || 'same-domain';
if (!['same-domain', 'cross-domain'].includes(lens)) {
  errors.push('lens must be same-domain or cross-domain');
}
const sources = Array.isArray(data.sources) ? data.sources : [];
if (sources.length < 2) errors.push('sources must contain at least two entries');

const anchors = new Map();
const rhetoricalForms = new Set(['literal', 'metaphorical', 'mixed']);
const videoId = (url) => {
  const match = String(url || '').match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|shorts\/|embed\/))([A-Za-z0-9_-]{6,})/);
  return match?.[1] || null;
};

for (const [index, source] of sources.entries()) {
  const sourceLabel = `sources[${index}]`;
  if (!source.video_id) errors.push(`${sourceLabel}.video_id is required`);
  if (!source.speaker) errors.push(`${sourceLabel}.speaker is required`);
  if (!videoId(source.url) || videoId(source.url) !== source.video_id) {
    errors.push(`${sourceLabel}.url does not contain the declared video_id`);
  }
  for (const [anchorIndex, anchor] of (source.anchors || []).entries()) {
    const label = `${sourceLabel}.anchors[${anchorIndex}]`;
    if (!anchor.anchor_id) errors.push(`${label}.anchor_id is required`);
    if (!rhetoricalForms.has(anchor.rhetorical_form)) {
      errors.push(`${label}.rhetorical_form must be literal, metaphorical, or mixed`);
    }
    if (!Number.isFinite(anchor.start) || !Number.isFinite(anchor.end) || anchor.start < 0 || anchor.end <= anchor.start) {
      errors.push(`${label} must have finite start/end seconds with end > start`);
    }
    const parsed = videoId(anchor.timestamp_url);
    const t = String(anchor.timestamp_url || '').match(/[?&]t=(\d+)/)?.[1];
    if (parsed !== source.video_id || Number(t) !== anchor.start) {
      errors.push(`${label}.timestamp_url must match video_id and start`);
    }
    if (anchor.anchor_id) {
      if (anchors.has(anchor.anchor_id)) errors.push(`${label}.anchor_id duplicates ${anchor.anchor_id}; anchor IDs must be globally unique`);
      else anchors.set(anchor.anchor_id, { source, anchor });
    }
  }
}

const semanticFrames = new Map();
const anchorFrameCounts = new Map();
for (const [index, frame] of (Array.isArray(data.semantic_frames) ? data.semantic_frames : []).entries()) {
  const label = `semantic_frames[${index}]`;
  if (!frame || typeof frame !== 'object') {
    errors.push(`${label} must be an object`);
    continue;
  }
  if (!String(frame.frame_id || '').trim()) {
    errors.push(`${label}.frame_id is required`);
  } else if (semanticFrames.has(frame.frame_id)) {
    errors.push(`${label}.frame_id duplicates ${frame.frame_id}`);
  }

  const anchored = anchors.get(frame.anchor_id);
  if (!String(frame.anchor_id || '').trim()) {
    errors.push(`${label}.anchor_id is required`);
  } else if (!anchored) {
    errors.push(`${label} references unknown anchor ${frame.anchor_id}`);
  } else {
    anchorFrameCounts.set(frame.anchor_id, (anchorFrameCounts.get(frame.anchor_id) || 0) + 1);
  }

  const imageTerms = Array.isArray(frame.source_image_terms)
    ? frame.source_image_terms.filter((term) => typeof term === 'string' && term.trim())
    : [];
  if (imageTerms.length === 0) {
    errors.push(`${label}.source_image_terms must contain at least one non-empty term`);
  }
  if (!String(frame.underlying_claim || '').trim()) {
    errors.push(`${label}.underlying_claim is required`);
  }

  if (frame.frame_id && !semanticFrames.has(frame.frame_id) && anchored) {
    semanticFrames.set(frame.frame_id, { frame, anchor: anchored.anchor, source: anchored.source });
  }
}

for (const [anchorId, anchored] of anchors) {
  const count = anchorFrameCounts.get(anchorId) || 0;
  if (['metaphorical', 'mixed'].includes(anchored.anchor.rhetorical_form) && count !== 1) {
    errors.push(`${anchored.anchor.rhetorical_form} anchor ${anchorId} must have exactly one semantic frame`);
  }
  if (anchored.anchor.rhetorical_form === 'literal' && count !== 0) {
    errors.push(`literal anchor ${anchorId} must not have a semantic frame`);
  }
}

for (const [index, claim] of (Array.isArray(data.claims) ? data.claims : []).entries()) {
  const label = `claims[${index}]`;
  if (!claim.speaker || !claim.text) errors.push(`${label} needs speaker and text`);
  if (claim.label === 'cross_domain_analogy') {
    errors.push(`${label} cross-domain synthesis belongs in bridges, not participant claims`);
  }
  const ids = Array.isArray(claim.support_anchor_ids) ? claim.support_anchor_ids : [];
  if (claim.speaker !== 'moderator' && ids.length === 0) errors.push(`${label} needs support_anchor_ids`);
  for (const id of ids) if (!anchors.has(id)) errors.push(`${label} references unknown anchor ${id}`);
  if (claim.label === 'direct_quote' && !claim.transcript_span) errors.push(`${label} direct_quote needs transcript_span`);
}

const bridges = Array.isArray(data.bridges) ? data.bridges : [];
if (lens === 'cross-domain' && bridges.length === 0) {
  errors.push('cross-domain lens requires at least one bridge');
}
const bridgeIds = new Set();
for (const [index, bridge] of bridges.entries()) {
  const label = `bridges[${index}]`;
  if (!bridge || typeof bridge !== 'object') {
    errors.push(`${label} must be an object`);
    continue;
  }
  if (!bridge.bridge_id) errors.push(`${label}.bridge_id is required`);
  else if (bridgeIds.has(bridge.bridge_id)) errors.push(`${label}.bridge_id duplicates ${bridge.bridge_id}`);
  else bridgeIds.add(bridge.bridge_id);
  if (bridge.author !== 'AI moderator') errors.push(`${label}.author must be AI moderator`);
  if (bridge.speaker) errors.push(`${label}.speaker is not allowed; cross-domain bridges cannot be attributed to a participant`);
  if (!['cross_domain_hypothesis', 'cross_domain_boundary'].includes(bridge.label)) {
    errors.push(`${label}.label must be cross_domain_hypothesis or cross_domain_boundary`);
  }
  if (!String(bridge.meta_theme || '').trim()) errors.push(`${label}.meta_theme is required`);
  if (!String(bridge.text || '').trim()) errors.push(`${label}.text is required`);
  if (!String(bridge.difference || '').trim()) errors.push(`${label}.difference is required`);
  if (!['tentative', 'moderate', 'strong'].includes(bridge.confidence)) {
    errors.push(`${label}.confidence must be tentative, moderate, or strong`);
  }

  const ids = Array.isArray(bridge.support_anchor_ids) ? bridge.support_anchor_ids : [];
  const sourceIds = new Set();
  for (const id of ids) {
    const anchored = anchors.get(id);
    if (!anchored) errors.push(`${label} references unknown anchor ${id}`);
    else sourceIds.add(anchored.source.source_id || anchored.source.video_id);
  }
  if (ids.length < 2 || sourceIds.size < 2) {
    errors.push(`${label} needs at least two anchors from different sources`);
  }
}

// A manifest can optionally describe where each evidence anchor is rendered.
// This is the boundary that prevents a planner from showing the same clip
// twice, or from creating multiple players for one evidence slot.
const evidenceUses = Array.isArray(data.evidence_uses) ? data.evidence_uses : [];
const usedAnchors = new Map();
const usedClips = new Map();
const usedSlides = new Set();
for (const [index, use] of evidenceUses.entries()) {
  const label = `evidence_uses[${index}]`;
  if (!use || typeof use !== 'object') {
    errors.push(`${label} must be an object`);
    continue;
  }
  for (const field of ['slide_id', 'anchor_id', 'video_id']) {
    if (!use[field]) errors.push(`${label}.${field} is required`);
  }
  if (use.slide_id) {
    if (usedSlides.has(use.slide_id)) errors.push(`${label} reuses slide_id ${use.slide_id}; each evidence slide gets one player`);
    usedSlides.add(use.slide_id);
  }
  const anchor = use.anchor_id ? anchors.get(use.anchor_id) : null;
  if (use.anchor_id && !anchor) errors.push(`${label} references unknown anchor ${use.anchor_id}`);
  if (!Number.isFinite(use.start) || !Number.isFinite(use.end) || use.start < 0 || use.end <= use.start) {
    errors.push(`${label} must have finite start/end seconds with end > start`);
  }
  if (anchor) {
    if (use.video_id !== anchor.source.video_id) errors.push(`${label}.video_id must match anchor ${use.anchor_id}`);
    if (use.start !== anchor.anchor.start || use.end !== anchor.anchor.end) {
      errors.push(`${label} range must match anchor ${use.anchor_id}`);
    }
  }
  const reuseAllowed = use.reuse_allowed === true;
  if (reuseAllowed && !String(use.reuse_reason || '').trim()) {
    errors.push(`${label}.reuse_reason is required when reuse_allowed is true`);
  }
  if (use.anchor_id) {
    const previous = usedAnchors.get(use.anchor_id);
    if (previous && !reuseAllowed) {
      errors.push(`${label} repeats anchor ${use.anchor_id}; show one evidence player and cross-reference the existing slide instead`);
    }
    usedAnchors.set(use.anchor_id, label);
  }
  if (use.video_id && Number.isFinite(use.start) && Number.isFinite(use.end)) {
    const clipKey = `${use.video_id}:${use.start}:${use.end}`;
    const previous = usedClips.get(clipKey);
    if (previous && !reuseAllowed) {
      errors.push(`${label} repeats clip ${clipKey}; duplicate players are not allowed`);
    }
    usedClips.set(clipKey, label);
  }
}

if (errors.length) {
  console.error(`Manifest invalid (${errors.length} issue${errors.length === 1 ? '' : 's'}):`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`Manifest valid: ${sources.length} sources, ${anchors.size} anchors, ${(data.claims || []).length} claims, ${bridges.length} bridges.`);

