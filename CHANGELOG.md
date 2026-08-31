# Changelog

All notable changes to Grounded Roundtable are recorded here. The project follows
[Semantic Versioning](https://semver.org/).

## [Unreleased]

## [0.3.0] - 2026-08-31

### Added

- Required `rhetorical_form` classification for every evidence anchor.
- Manifest-backed `semantic_frames` that separate source imagery from underlying claims.
- Relationship-aware `semantic_connections` for sequence, complement, and conflict questions.
- Deterministic validation for metaphor leakage and unsupported forced-choice wording.

### Changed

- Metaphorical and mixed anchors now require exactly one semantic frame; existing ordinary anchors migrate by adding `"rhetorical_form": "literal"`.
- Dialogue uses concept-level claims while verified source wording and imagery remain available to evidence and visual layers.

## [0.2.0] - 2026-08-31

### Added

- `same-domain` and `cross-domain` comparison lenses.
- AI-authored cross-domain `bridges`, kept separate from participant claims.
- Validation requiring multi-source support, confidence, and a consequential practice difference for each bridge.
- Tests for evidence-safe cross-domain synthesis.

### Changed

- Shortened the README around the public product contract and usage.
- Clarified that participant claims cannot be labeled as cross-domain analogies.

## [0.1.0] - 2026-08-31

### Added

- Initial public Grounded Roundtable skill for Codex and Claude Code.
- Source-grounded virtual dialogue with timestamped YouTube evidence anchors.
- Native Google Slides video-player guidance and provenance requirements.
- Manifest and native-slide structure validators.
- Natural Korean dialogue, disclosure, cost-budget, and evidence-model guidance.

[Unreleased]: https://github.com/smartkwang/grounded-roundtable/compare/v0.3.0...HEAD
[0.3.0]: https://github.com/smartkwang/grounded-roundtable/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/smartkwang/grounded-roundtable/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/smartkwang/grounded-roundtable/releases/tag/v0.1.0
