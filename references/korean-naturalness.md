# Korean naturalness pass

Use this pass after evidence verification and before placing dialogue on a slide. It is a compact, dialogue-specific adaptation of Korean humanizer practice. The goal is not to make the speakers slangy or to evade AI detection. The goal is to make a faithful paraphrase sound like something a Korean speaker could actually say in a thoughtful interview.

## Six checks

1. **Meaning first** — Protect names, numbers, conditions, uncertainty, scope, and the source's level of confidence. Never make a claim stronger just to make it smoother.
2. **Semantic level** — When a source uses a metaphor, fill `source_image_terms` and `underlying_claim` before drafting. Convert each image separately, classify the connection as `sequence`, `complement`, or `conflict`, and frame the moderator's question around one `shared_dimension` such as goals, priorities, constraints, or order of action.
3. **Actors and verbs** — Prefer a real person or institution as the subject and a concrete verb. Replace nominalized chains such as `~에 대한 필요성이 있다` with `~이 필요하다` or `~해야 한다` when the source supports it. Avoid empty availability verbs such as `가지고 있다`, `이루어지고 있다`, and `될 수 있다` unless they carry real meaning.
4. **Translationese and padding** — Review, do not blindly ban, `~에 대해`, `~을 통해`, `~에 있어서`, `~에 의해`, `이러한`, `해당`, `다음과 같이`, `결론적으로`, and repeated `~것입니다`. Replace them with a shorter clause or remove them when the relation is obvious.
5. **Register and relationship** — Keep the selected speech level consistent, but do not force every turn into the same `~습니다` cadence. Participants may use calm broadcast-style Korean; the moderator may be one step shorter and more direct. Never add fake rapport such as `말씀하신 것처럼` or `그 지적에 답하자면`.
6. **Rhythm and structure** — Mix short and medium sentences. One turn should carry one atomic claim. Avoid three-part slogan symmetry, generic “핵심은…” summaries, and conclusion markers at the end of every turn. Read the full scene aloud, not just each sentence.

## Metaphor reframing

Use the source metaphor as a visual memory cue, not as the grammar of the debate.

- **Dialogue layer:** moderator questions and participant `faithful_paraphrase` turns use underlying concepts without repeating the source-image words. If the user requests dialogue only, return this layer.
- **Evidence/visual layer:** verified source wording, a `direct_quote`, and metaphor imagery appear with the source clip or visual—not in the synthetic conversation.

| Source image | Underlying claim | Discussion wording |
|---|---|---|
| 오를 산을 먼저 정한다 | 목표와 방향을 먼저 정한다 | 무엇을 목표로 삼을지 먼저 정해야 할까요? |
| 멀리 가려면 짐을 덜어낸다 | 하지 않을 일을 정해 집중한다 | 목표에 집중하려면 무엇을 하지 않을지 정해야 할까요? |

These two ideas form a sequence, so ask at the shared conceptual level: `목표를 먼저 분명히 한 뒤, 무엇을 하지 않을지 어떻게 정할까요?` Use a contrast question only when the anchors establish a real conflict. The evidence slide may still show a mountain or luggage image and preserve the verified source wording.

## Practical rewrites

| Machine-like draft | Natural interview-style draft |
|---|---|
| 지능 격차가 크게 벌어지면, 인간이 계속 직접 통제할 수 있다는 가정은 현실적이지 않을 수 있습니다. | 지능 차이가 너무 벌어지면, 사람이 끝까지 직접 통제할 수 있다고 보긴 어렵습니다. |
| 목표는 AI가 인류를 배려하고 진실을 추구하도록 만드는 일입니다. | AI가 인류에 도움이 되고 진실을 찾도록 만드는 게 더 현실적인 목표일 겁니다. |
| 이러한 이유로 속도 조절이 필요합니다. | 그래서 속도를 늦출 필요가 있습니다. |
| 외부 중재가 작동하는 것이 중요합니다. | 바깥에서 기준을 세우고 중재해야 합니다. |

## Final rejection tests

Reject and rewrite a turn if it:

- could be pasted into a policy report without changing a word;
- contains two or more abstract nouns before the main verb;
- uses `결론적으로`, `이러한`, `해당`, or `다음과 같습니다` only to sound organized;
- repeats the same ending three turns in a row;
- adds agreement, rebuttal, emotion, or personal experience not present in the source;
- repeats a metaphor's source-image words in a synthetic question or `faithful_paraphrase` turn;
- carries two unrelated source metaphors into the same comparison instead of naming their underlying claims;
- turns sequential or complementary claims into an unsupported either/or choice;
- reads like a subtitle translation when spoken aloud.

After this editorial pass, copy the exact final wording into the manifest and run `node scripts/validate_manifest.mjs <manifest.json>`, including for dialogue-only output. If it identifies a claim, connection, or bridge, rewrite only that turn once and update the manifest before revalidation. Do not weaken the source-image list merely to make invalid dialogue pass.

