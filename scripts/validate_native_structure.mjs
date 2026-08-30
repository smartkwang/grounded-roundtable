#!/usr/bin/env node
import fs from 'node:fs';

const [file, ...args] = process.argv.slice(2);
if (!file) {
  console.error('Usage: node validate_native_structure.mjs <presentation.json> --evidence-slides=p3,p4');
  process.exit(2);
}

let raw;
try {
  raw = JSON.parse(fs.readFileSync(file, 'utf8'));
} catch (error) {
  console.error(`Cannot read presentation JSON: ${error.message}`);
  process.exit(2);
}

const data = raw.structuredContent || raw;
const slideArg = args.find((arg) => arg.startsWith('--evidence-slides='));
const requestedIds = slideArg
  ? slideArg.slice('--evidence-slides='.length).split(',').map((id) => id.trim()).filter(Boolean)
  : [];
const slides = Array.isArray(data.slides) ? data.slides : [];
const selected = requestedIds.length
  ? requestedIds.map((id) => slides.find((slide) => slide.objectId === id)).filter(Boolean)
  : slides.filter((slide) => (slide.pageElements || []).some((element) => element.video?.source === 'YOUTUBE'));

const errors = [];
if (!slides.length) errors.push('presentation.slides must contain at least one slide');
if (requestedIds.length && selected.length !== requestedIds.length) {
  const found = new Set(selected.map((slide) => slide.objectId));
  errors.push(`unknown evidence slide(s): ${requestedIds.filter((id) => !found.has(id)).join(', ')}`);
}
if (!selected.length) errors.push('no evidence slides selected; pass --evidence-slides=p3,p4 or provide YOUTUBE elements');

const width = Number(data.pageSize?.width?.magnitude) || Infinity;
const height = Number(data.pageSize?.height?.magnitude) || Infinity;
const clips = new Map();

function box(element) {
  const x = Number(element.transform?.translateX) || 0;
  const y = Number(element.transform?.translateY) || 0;
  const w = (Number(element.size?.width?.magnitude) || 0) * (Number(element.transform?.scaleX) || 1);
  const h = (Number(element.size?.height?.magnitude) || 0) * (Number(element.transform?.scaleY) || 1);
  return { x, y, w, h };
}

function intersects(a, b) {
  return Math.max(0, Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x)) > 0
    && Math.max(0, Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y)) > 0;
}

for (const slide of selected) {
  const elements = Array.isArray(slide.pageElements) ? slide.pageElements : [];
  const videos = elements.filter((element) => element.video?.source === 'YOUTUBE');
  const images = elements.filter((element) => element.image);
  if (videos.length !== 1) errors.push(`${slide.objectId} must contain exactly one native YOUTUBE element (found ${videos.length})`);
  if (images.length) errors.push(`${slide.objectId} still contains ${images.length} image placeholder(s); delete the fallback thumbnail after native insertion`);

  const boxes = videos.map(box);
  for (const [index, rect] of boxes.entries()) {
    if (rect.w <= 0 || rect.h <= 0) errors.push(`${slide.objectId} video[${index}] has an empty bounding box`);
    if (rect.x < 0 || rect.y < 0 || rect.x + rect.w > width || rect.y + rect.h > height) {
      errors.push(`${slide.objectId} video[${index}] is outside the slide bounds`);
    }
    for (let other = index + 1; other < boxes.length; other += 1) {
      if (intersects(rect, boxes[other])) errors.push(`${slide.objectId} has overlapping native video elements`);
    }
  }

  for (const videoElement of videos) {
    const video = videoElement.video;
    const props = video.videoProperties || {};
    if (!video.id) errors.push(`${slide.objectId} native video is missing the original YouTube video id`);
    if (!Number.isFinite(props.start) || !Number.isFinite(props.end) || props.end <= props.start) {
      errors.push(`${slide.objectId} native video needs finite start/end properties with end > start`);
    }
    if (video.id && Number.isFinite(props.start) && Number.isFinite(props.end)) {
      const key = `${video.id}:${props.start}:${props.end}`;
      if (clips.has(key)) errors.push(`${slide.objectId} repeats native clip ${key}; one evidence player per clip`);
      clips.set(key, slide.objectId);
    }
  }
}

if (errors.length) {
  console.error(`Native structure invalid (${errors.length} issue${errors.length === 1 ? '' : 's'}):`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`Native structure valid: ${selected.length} evidence slides, ${clips.size} unique clips.`);

