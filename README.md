# Grounded Roundtable

**Create a source-grounded virtual roundtable from two or more YouTube interviews, with every important claim linked to playable evidence.**

[한국어 README](README.ko.md) · [Google Slides example](https://docs.google.com/presentation/d/1zP8h6n0cUX9D8Ui6xQOocPRvUoshRaIpijkeYpF8jNY/edit?usp=sharing)

![Native YouTube evidence slide](docs/evidence-slide.png)

## What it produces

- natural Korean dialogue that preserves each source's scope and uncertainty;
- a persistent disclosure that the conversation is AI-constructed;
- native YouTube players with exact start and end times in Google Slides;
- channel attribution, timestamp links, and caption status beside each player;
- validation for claims missing evidence anchors, repeated clips, and overlapping players;
- optional cross-domain bridges kept separate from participant claims.

## Install

### Codex

```bash
git clone https://github.com/smartkwang/grounded-roundtable.git ~/.codex/skills/grounded-roundtable
```

### Claude Code

```bash
git clone https://github.com/smartkwang/grounded-roundtable.git ~/.claude/skills/grounded-roundtable
```

Start a new agent session after installation.

## Use

```text
Use grounded-roundtable with these YouTube videos:
- https://youtu.be/...
- https://youtu.be/...

Lens: cross-domain
Direction: tension-first
Audience: organization leaders
Create a native Google Slides deck in Korean.
```

`lens` controls what is compared:

- `same-domain` — compare positions within a shared field;
- `cross-domain` — connect different fields through an AI-moderated hypothesis, followed by a meaningful practice difference.

`direction` controls the conversation flow: `tension-first`, `common-ground-first`, `forecast-to-choice`, or `solutions-first`.

## Evidence model

Participant claims cite timestamped source anchors. Cross-domain connections are stored separately as AI-authored `bridges`; each bridge requires anchors from at least two sources and must state how the fields differ.

```bash
node scripts/validate_manifest.mjs examples/manifest.json
node scripts/validate_native_structure.mjs presentation.json --evidence-slides=p4,p5,p6
```

## Limitations

- Participants did not hear or answer one another.
- Automatic captions help locate evidence; direct quotations require original-audio review.
- Native playback depends on video availability and Google Slides permissions.
- An evidence anchor makes a claim reviewable; it does not prove that generated wording was spoken verbatim.

## Contributing

Issues and pull requests are welcome. See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

MIT

