# Token and cost budget

The expensive mistake is reducing verification while keeping the same output scope. Use this order when the user's plan or model budget is small:

1. choose one shared topic;
2. use three scenes instead of four;
3. keep 6–8 turns per scene;
4. keep one atomic claim per participant turn;
5. use short, verified paraphrases and two anchors per scene;
6. remove decorative copy and duplicate summaries.

Cache metadata, captions, normalized transcript chunks, and the evidence manifest. Summarize each source once, then retrieve only the chunks around candidate anchors. Do not send full long transcripts to every generation pass. A two-pass design (evidence map → dialogue/deck) is cheaper and safer than drafting dialogue while searching.

Never trade away speaker identity, source URL, timestamp, claim–anchor fit, virtual disclosure, or post-import link checks. If those cannot be completed, stop at a clearly labeled evidence-map draft rather than presenting a polished but unverifiable deck.


