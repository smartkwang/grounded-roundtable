# Korean naturalness pass

Use this pass after evidence verification and before placing dialogue on a slide. It is a compact, dialogue-specific adaptation of Korean humanizer practice. The goal is not to make the speakers slangy or to evade AI detection. The goal is to make a faithful paraphrase sound like something a Korean speaker could actually say in a thoughtful interview.

## Five checks

1. **Meaning first** — Protect names, numbers, conditions, uncertainty, scope, and the source's level of confidence. Never make a claim stronger just to make it smoother.
2. **Actors and verbs** — Prefer a real person or institution as the subject and a concrete verb. Replace nominalized chains such as `~에 대한 필요성이 있다` with `~이 필요하다` or `~해야 한다` when the source supports it. Avoid empty availability verbs such as `가지고 있다`, `이루어지고 있다`, and `될 수 있다` unless they carry real meaning.
3. **Translationese and padding** — Review, do not blindly ban, `~에 대해`, `~을 통해`, `~에 있어서`, `~에 의해`, `이러한`, `해당`, `다음과 같이`, `결론적으로`, and repeated `~것입니다`. Replace them with a shorter clause or remove them when the relation is obvious.
4. **Register and relationship** — Keep the selected speech level consistent, but do not force every turn into the same `~습니다` cadence. Participants may use calm broadcast-style Korean; the moderator may be one step shorter and more direct. Never add fake rapport such as `말씀하신 것처럼` or `그 지적에 답하자면`.
5. **Rhythm and structure** — Mix short and medium sentences. One turn should carry one atomic claim. Avoid three-part slogan symmetry, generic “핵심은…” summaries, and conclusion markers at the end of every turn. Read the full scene aloud, not just each sentence.

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
- reads like a subtitle translation when spoken aloud.

