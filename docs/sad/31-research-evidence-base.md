# HP-SAD-31 · Research evidence base

| Field       | Value                                                                       |
| ----------- | --------------------------------------------------------------------------- |
| Document ID | HP-SAD-31                                                                   |
| Version     | 1.1                                                                         |
| Status      | Frozen for Phase 2 spike                                                    |
| Date        | 2026-11-09                                                                  |
| Owner       | Sanaullah Jannisar, product and engineering lead                            |
| Conforms to | PRISMA 2020 reporting items where applicable (rapid review, not systematic) |

## 1. Purpose and scope

The package makes design choices that rest on claims about people and systems: that a human approval gate builds trust, that people tire of confirmations, that reminders cut no-shows, that verified reviews are more credible, that one offer beats a list, that agent-to-agent text is an attack surface, and that a two-sided directory can be started one side first. This document checks each claim against peer-reviewed research, says how strong the evidence is, and says where the evidence supports, complicates or fails to support the design.

It is a rapid review run by me on 2026-11-09. It is not a systematic review: one reviewer, one database tool, the top three results per query. It informs decisions; it does not replace the A-01 and A-02 field tests in [03 Business case](03-business-case.md).

## 2. Method

| Item             | Detail                                                                                                                                                                                      |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Source           | Consensus academic search (Semantic Scholar, OpenAlex and PubMed corpus), queried 2026-11-09                                                                                                |
| Filter           | Peer-reviewed only where the tool allowed it; preprints and theses are kept only when nothing better appeared, and are flagged                                                              |
| Queries          | 18 in two rounds (12 for the booking claims, 6 for the network thesis), listed in section 16                                                                                                |
| Results screened | 54 (top 3 per query, the tool's limit on this plan)                                                                                                                                         |
| Included         | 46 cited; 8 screened out (listed in section 16). E-commerce barrier studies from unrelated contexts are kept but flagged as indirect                                                        |
| Inclusion rule   | Addresses the claim directly, or is the closest available evidence and says so                                                                                                              |
| Extraction       | Design, sample, effect size as reported in the abstract; I did not read full texts, so effect sizes are as the abstract states them                                                         |
| Citation rule    | Every reference below was returned by the search tool in this session. Links are the tool's record pages with tracking parameters removed; the free plan returns no DOIs, so none are given |

Limits I accept: abstract-level extraction, no risk-of-bias scoring per study, no second reviewer, and three results per query, which favours highly cited and recent work.

## 3. Evidence strength legend

| Level | Design                                                           |
| ----- | ---------------------------------------------------------------- |
| 1     | Meta-analysis or systematic review of controlled studies         |
| 2     | Randomised controlled trial or large controlled field experiment |
| 3     | Observational cohort or large-sample survey                      |
| 4     | Small experiment, case study, conceptual framework, benchmark    |
| 5     | Expert opinion, thesis, unreviewed preprint                      |

Verdicts: **Supported** (level 1 or 2 evidence agrees), **Mixed** (evidence disagrees or depends on moderators), **Indirect** (evidence is from another domain and transfers with stated caveats), **Untested** (no usable evidence found; the design choice is an assumption).

## 4. Trust in automation and AI agents (approval gate, ADR 0007)

**Question.** Does keeping a human decision in the loop lead to appropriate trust, and what goes wrong when people over-trust automation?

**Findings.**

- A review of 96 trust-calibration studies drawn from more than 1,000 papers found that interventions to calibrate trust are promising, but that how calibration is measured often limits what the results can show [[S1](https://consensus.app/papers/details/4f1a681ff4fb5cbd98f61dda3decd987/)] (Wischnewski et al., 2023, CHI; level 1, narrative).
- A PRISMA review of 35 studies on automation bias in human and AI collaboration found that explanations alone often do not improve decision accuracy and can reinforce misplaced trust, and that requiring users to verify actively is the most effective lever against complacency [[S2](https://consensus.app/papers/details/c15457f004325789909055df8acbdd9d/)] (Romeo et al., 2025, AI & Society; level 1).
- Work on driving automation finds that experience, especially of system malfunctions and recovery, drives trust calibration, and that common trust measures lack reliability and validity [[S3](https://consensus.app/papers/details/86e5473a8d185634a62b45de524b6bc2/)] (Walker et al., 2023, Frontiers in Psychology; level 4, conceptual review).
- An evidence map of agentic commerce found that delegation depends less on maximising autonomy than on pairing capability with user governance (consent, oversight, recourse); autonomy cues without safeguards triggered reactance. It also notes that most studies measure intentions or vignettes, not real execution [[S4](https://consensus.app/papers/details/c0a40f7150c2514c822fd3c6d45830e2/)] (Balaskas, 2026, Information; level 1, evidence map).

**Quality and limits.** The reviews are recent and broad, but the underlying studies are mostly lab tasks, clinical or driving settings, and intention measures. None studies booking a haircut.

**What it means for Hitchpost.** The approval gate (ADR 0007) is supported as a governance safeguard: [S4] is the closest match to our domain and says governance, not raw autonomy, drives acceptance. But [S2] warns that a gate people click through without checking adds little. The gate must make Dana check something (the time and price), not just tap "Yes".

**Verdict.** Supported for "a human gate increases acceptance of delegation"; **Mixed** for "a gate on its own produces calibrated trust".

## 5. Levels of automation and automation boundaries

**Question.** Is there a principled way to decide what the agent does alone and what the human decides?

**Findings.**

- Parasuraman, Sheridan and Wickens proposed automating four function types (information acquisition, analysis, decision selection, action implementation) each at its own level, judged by human performance consequences, reliability and the cost of a wrong action [[S5](https://consensus.app/papers/details/dee512f82b2152fcaa28f37ea0a8367d/)] (2000, IEEE SMC-A; 4,513 citations; level 4, framework).
- Kaber argues the levels framework still has design value but rests on presumptions about human behaviour that need precise, descriptive models [[S6](https://consensus.app/papers/details/d6800400670f56f5bdaf0b55aefae3c7/)] (2018, JCEDM; level 4).
- Liu et al. propose a continuous "automation proportion" measure built from hierarchical task analysis [[S7](https://consensus.app/papers/details/8e411d3a3b2e5d2ba2ca5596e34705ad/)] (2025, Ergonomics; level 4).

**What it means for Hitchpost.** The framework fits our split directly: the agents fully automate information acquisition and analysis (finding free slots), the agent proposes one decision (the offer), and action implementation (booking, spending time and money) stays behind the human gate because a wrong action is costly. This gives the automation boundary a citable basis rather than intuition.

**Verdict.** Supported as a design framework (it is a framework, not an effect size).

## 6. Approval fatigue and confirmation dialogs (risk to the gate; 14 UI design)

**Question.** Do repeated approvals lose their value?

**Findings.**

- A retrospective cohort of 112 primary care clinicians (2010 to 2013) found reminder acceptance dropped 30% for each additional reminder per encounter and 10% for each five-point rise in the share of repeated reminders; workload itself had no effect [[S8](https://consensus.app/papers/details/67df189d6bf25136a9ebc8dfa22dba5f/)] (Ancker et al., 2017, BMC Med Inform Decis Mak; 651 citations; level 3).
- Baysari et al. argue that under overload, overriding alerts becomes habitual and automatic rather than a considered decision [[S9](https://consensus.app/papers/details/454b2848f81057c0a40f9873654fefc3/)] (2017, JAMIA; level 4, perspective with supporting evidence).
- A review of 22 systematic reviews found alert fatigue is rarely defined operationally; it recommends measuring a sustained fall in appropriate response rates from a baseline [[S10](https://consensus.app/papers/details/3dc0983f4b2854b3a978281af7800c5d/)] (Ray et al., 2026, JAMIA; level 1).

**Quality and limits.** All clinical; clinicians face far more alerts than Dana will see approvals. Transfer is about the mechanism (volume and repetition erode attention), not the size.

**What it means for Hitchpost.** One approval per booking every three to four weeks is low volume, which is reassuring. The risk grows if the gate also fires for reschedules, holds and reminders. Per [S10], I should measure fatigue directly: median time to approve and the share of approvals made in under two seconds, against Dana's own baseline.

**Verdict.** **Indirect.** Volume and repetition are the risk factors; our design keeps both low.

## 7. Appointment no-shows, reminders and booking channel (north star, P-01)

**Question.** Do reminders reduce no-shows, and does booking online change no-show rates?

**Findings.**

- A meta-analysis of 28 studies (13 RCTs) found SMS reminders improve attendance, pooled odds ratio 1.62 (1.35 to 1.94) in the RCTs; timing and frequency made no significant difference [[S11](https://consensus.app/papers/details/eb643614a2f05985b899ca16b5c36c29/)] (Boksmati et al., 2016, J Med Syst; 103 citations; level 1).
- A systematic review of 61 randomised or quasi-experimental studies of behavioural economic interventions found reminders (SMS, phone, mail) effective across settings; other nudges are largely untested [[S12](https://consensus.app/papers/details/9d7b9976822c51dc8c9cf3efd4cc77c1/)] (Werner et al., 2023, BMC Health Serv Res; level 1).
- A meta-analysis of 12 studies found SMS reminders cut non-attendance, risk ratio 0.77 (0.71 to 0.84) [[S13](https://consensus.app/papers/details/bd93432053fa59729d702f8914f3292c/)] (Tang, 2022; level 1, low-visibility journal, 3 citations, treat with caution).
- Online booking and no-shows point in both directions: in one ophthalmology practice online bookings had fewer no-shows (median 1.8% vs 5.9%), but in the linked university hospital more (14.3% vs 11.2%) [[S14](https://consensus.app/papers/details/87c4f35e2cbe5364888b0c5ef4e99df6/)] (Kammrath Betancor et al., 2025, Front Digit Health; n = 98,067 appointments; level 3). A 12-week study in the same practice found 1.6% vs 6.8% [[S15](https://consensus.app/papers/details/2d3b883f9bcf51c2851f304058c4bc40/)] (2024, Digital Health; level 3). Self-scheduled mammograms had slightly more no-shows, adjusted odds ratio 1.12 (1.02 to 1.23) [[S16](https://consensus.app/papers/details/ce7b866ec5585b6ba0b25df966a09f3d/)] (North et al., 2021, JMIR Med Inform; n = 93,901 patients; level 3).

**Quality and limits.** Strong for reminders, all in health care. Booking-channel effects depend on setting.

**What it means for Hitchpost.** My north star counts honored bookings, so no-shows hit it directly. Reminders are the best-supported lever available, and the package does not yet specify one. Agent booking will not automatically reduce no-shows; [S14] to [S16] show the channel can go either way.

**Verdict.** Supported (reminders reduce no-shows, health care evidence). **Mixed** (whether agent or online booking itself changes no-shows).

## 8. Small business technology adoption (A-02, sales)

**Question.** What stops small service businesses adopting new booking technology?

**Findings.**

- A survey of 2,222 Indonesian micro and small enterprises found adoption explained by business, firm and owner characteristics; higher-income firms adopted more [[S17](https://consensus.app/papers/details/de3d8cb1d3cf5bb49b781ca6133ad594/)] (Trinugroho et al., 2021, Finance Research Letters; level 3).
- A literature review extends the Technology-Organization-Environment framework with the owner-manager's personal characteristics as a distinct barrier [[S18](https://consensus.app/papers/details/dd069434db605e98874476160b63995b/)] (Nazir et al., 2021, EMAJ; level 4).
- A fuzzy-DEMATEL expert study ranked lack of benchmarking and of top-management commitment as the most influential e-commerce barriers [[S19](https://consensus.app/papers/details/ee4a2b77d9625712992c60a4684a7512/)] (Yadav et al., 2022; level 4).

**Quality and limits.** Weak transfer: emerging economies, e-commerce in general, not barbers or booking tools in our market.

**What it means for Hitchpost.** The one consistent signal is that the owner's own characteristics and commitment decide adoption, which matches the plan to sell to Marcus in person. There is no usable evidence on barbers adopting agent-facing booking.

**Verdict.** **Untested** for our market. A-02 must rest on the barber interviews, not on literature.

## 9. Online reviews and verification (ratings design, FR-RATE-01)

**Question.** Do fake reviews damage trust, and does verification help?

**Findings.**

- A systematic review finds fake reviews distort decisions, erode trust and weaken platform credibility, and calls for stronger verification and disclosure [[S20](https://consensus.app/papers/details/f6536c3776b45fd29ec35db053d85491/)] (Orzan et al., 2026, Int J Consumer Studies; level 1).
- Reviews suspected as fake lower valuation, brand attitude and purchasing; the study identifies the cues consumers use to judge authenticity [[S21](https://consensus.app/papers/details/bed73db595385fd2a1aa8e6295fd03d7/)] (Harrison-Walker and Jiang, 2023, J Bus Res; level 2 to 3).
- On Amazon data, the verified-purchase attribute was among the strongest signals for detecting fake reviews, especially for experience and credence products [[S22](https://consensus.app/papers/details/31f07bb647a751f3bb8114fefdd868e9/)] (Hájek et al., 2023, J Bus Res; level 4, detection model).

**What it means for Hitchpost.** FR-RATE-01 (only verified interactions can be rated) is directly supported: verification is both what consumers look for and what separates real from fake. A haircut is an experience good, the category where [S22] found verification mattered most.

**Verdict.** Supported.

## 10. Choice overload, defaults and offering one slot (13 interfaces, 14 UI)

**Question.** Is offering one slot better than a list?

**Findings.**

- A meta-analysis of 50 experiments (N = 5,036) found a mean choice-overload effect of virtually zero with large variance [[S23](https://consensus.app/papers/details/2930f189fab95d3495ebbfedb94f142b/)] (Scheibehenne et al., 2010, J Consumer Research; 1,069 citations; level 1).
- A later meta-analysis of 99 observations (N = 7,202) found a significant effect once moderators are included: overload is more likely with harder tasks, complex sets, uncertain preferences and an effort-minimising goal [[S24](https://consensus.app/papers/details/c7be5e074f57554893b5ee8df581e539/)] (Chernev et al., 2015, J Consumer Psychology; 817 citations; level 1).
- Under time pressure, 10 options made decisions harder and less satisfying than 3 [[S25](https://consensus.app/papers/details/76d5755c1c375230b3753453aef03736/)] (Haynes, 2009, Psychology & Marketing; level 2, single experiment).
- In AI voice shopping (n = 484), evaluating fewer alternatives went with higher satisfaction and more willingness to delegate to the assistant [[S26](https://consensus.app/papers/details/2907266f99f6537d8b441fba5317f30e/)] (Mari et al., 2025, J Interactive Marketing; level 2).
- A meta-analysis of 58 default studies (n = 73,675) found a strong default effect, d = 0.68 (0.53 to 0.83), stronger in consumer domains and when the default reads as an endorsement [[S27](https://consensus.app/papers/details/3acd0367c8105d88858871badac1257d/)] (Jachimowicz et al., 2019, Behavioural Public Policy; level 1).

**What it means for Hitchpost.** Dana's goal is to minimise effort, which is the moderator [S24] says produces overload; [S26] finds the same in AI-assisted shopping. Offering one slot is supported. But [S27] means the offered slot works as a strong default: Dana will tend to accept whatever comes first. That is a duty, not a free win. The agent must offer the slot that best fits her request, never the one that suits the shop, and declining must stay one tap away. This links to the dark-pattern concerns in [14 User interface design](14-user-interface-design.md).

**Verdict.** Supported for a single offer in an effort-minimising task, with a stated ethical condition on how the offer is chosen.

## 11. Prompt injection and agent-to-agent security (NFR-SEC-01)

**Question.** Is text from another agent a real attack surface?

**Findings.**

- Greshake et al. showed indirect prompt injection against real LLM-integrated applications (Bing Chat, code completion, GPT-4 apps): injected text in retrieved data can manipulate behaviour, exfiltrate data and control which APIs are called [[S28](https://consensus.app/papers/details/667ace18801a59ce89d56d0e636d376c/)] (2023, ACM AISec Workshop; 2,408 citations; level 4, demonstrated attacks).
- InjecAgent tested 30 LLM agents on 1,054 cases; ReAct-prompted GPT-4 was vulnerable 24% of the time, nearly doubling with a reinforced attacker prompt [[S29](https://consensus.app/papers/details/1f22a6682586514aaa8f32ad3e8a9fb5/)] (Zhan et al., 2024; the tool lists it as arXiv; level 4 to 5).
- Adaptive attacks bypassed all eight tested defences, each at over 50% success [[S30](https://consensus.app/papers/details/cadf2fb6ff3b5d138c4b896604a4e7ba/)] (Zhan et al., 2025; venue not given by the tool; level 5).

**What it means for Hitchpost.** This is the strongest external backing for two design choices: inbound agent messages are untrusted data (NFR-SEC-01), and Phase 1 uses typed data parts with no language model in the decision path ([ADR 0010](../decisions/0010-typed-data-parts-before-llm.md)). [S30] says prompt-level defences do not hold, so when a model is added later it must never sit between inbound text and a commitment; only the typed gate can commit.

**Verdict.** Supported (as a threat; demonstrated attacks, not effect sizes in our setting).

## 12. Two-sided platform cold start (cold-start plan, A-08, R-12)

**Question.** Can a two-sided directory start with one side, in one place?

**Findings.**

- A review frames the "mutual baiting" or chicken-and-egg problem as one of the critical early challenges for multi-sided platforms [[S31](https://consensus.app/papers/details/4a87b4e816f15ba48f8b00e81baed642/)] (Stummer et al., 2018, BISE; level 4).
- A multi-case study of ten platform startups found a range of entry strategies distinguishable by strategic, relational and timing factors [[S32](https://consensus.app/papers/details/b3c5e2b21a86516cbd5b0ccb3d473289/)] (Veisdal, 2020, Electronic Markets; level 4).
- A master's thesis comparing six platforms found that a tight category and geography focus, seeding supply, low friction and trust-building mattered; unbalanced, supply-first growth could reach critical mass [[S33](https://consensus.app/papers/details/a7aa55954bd45d359257eb582dfca519/)] (Solheim and Berg, 2017; level 5, not peer reviewed).

**What it means for Hitchpost.** The one-neighbourhood, barber-first plan matches the only concrete guidance found ([S33]), but that guidance is a thesis and case-level. The evidence does not tell me whether supply-first works when the demand side has to install a new app, which is the gap the go-to-market panel flagged.

**Verdict.** **Mixed.** The approach matches case evidence; nothing tests it rigorously. A-08 stays an assumption to test in the pilot.

## 13. The network thesis: what the evidence does and doesn't say

The round 4 and 5 vision rests on four claims that the booking evidence above doesn't cover: that agents can usefully talk to other agents for their owners, that people will let their agent share what they know, that people will consult (and maybe one day pay for) someone else's knowledge, and that an open protocol can be adopted without being paid for. Hitchpost is a protocol first and nobody pays ([ADR 0020](../decisions/0020-protocol-first.md)), so the last claim matters most.

### 13.1 Agents talking to agents for their owners

- A study of LLM agents negotiating with each other found that behavioural tactics (for example, posing as desperate) raised one side's payoff by about 20% against a standard GPT-4 agent, and quantified irrational negotiation behaviour [S34]. That supports keeping commitments behind a human gate and typed messages: free-form agent-to-agent negotiation is manipulable.
- A 2026 workshop paper proposes an exchange for personal LLM agents with typed messages, policy enforcement and routing, and reports that stricter policies improved robustness and fairness at the cost of latency and message volume in runs of 5 to 12 agents [S35]. It is the closest published design to Hitchpost's, and it is small-scale.
- A framework paper argues delegation to agents should be visible, negotiable and auditable, with accountability logs [S36]. It is conceptual (level 4).
- Verdict: **Indirect**. There is no field evidence yet of real people's agents doing useful work with strangers' agents at scale. The design choices it supports (typed messages, policy enforcement, audit logs, a human gate) are already in the package; the claim that people want this remains A-12 and the release criteria.

### 13.2 Willingness to share knowledge through an agent

- A meta-analysis of 44 studies (14,023 participants) found both intrinsic and extrinsic motivation associated with knowledge sharing, intrinsic more strongly, with large moderation by context and culture [S37]. A 501-employee survey found reputation and reciprocity raise online knowledge sharing [S38].
- Studies of AI assistants find trust mediates the privacy trade-off: perceived privacy risk works through privacy concerns and trust rather than directly on adoption [S39], and in AI-driven services trust mediates both benefits and risks in data-sharing decisions [S40]. A systematic review notes privacy, security and trust perceptions overlap and are rarely measured together [S41].
- Verdict: **Mixed, indirect**. The evidence is organisational and about human-to-human or human-to-service sharing, not sharing through an agent. It supports per-tier sharing scopes, a visible activity log and owner control (trust levers), and it warns that context changes the effect. Whether owners will open their agents to followers is untested: an L2 assumption.

### 13.3 Consulting someone else's knowledge, and paying for it

- Interviews with 14 users of paid social Q&A sites found five reasons to pay, including the answerer's unique resources and more credible answers [S42]; panel data from a pay-to-view Q&A platform found answerer authentication and experience increased paying listeners [S43]. Both are from Chinese platforms.
- Verdict: **Indirect**. People do pay for answers from identified experts, and verification matters. That supports verified profiles (L2) more than it supports subscriptions. Paid consultation (L4) stays unpriced and Later, as decided.

### 13.4 Adopting an open protocol nobody pays for

- A widely cited analysis explains open-source diffusion through network externalities and community motivation rather than profit, with a heterogeneous-agent simulation of diffusion [S44]. A survey of agent protocols (MCP, ACP, A2A, ANP) proposes phased adoption (MCP for tools, then A2A for task delegation) [S45], and a systematic study of MCP catalogues 16 threat scenarios and the security safeguards adoption needs [S46].
- Verdict: **Indirect; adoption untested**. Open protocols can diffuse without payment when network effects and a community form; nothing here shows that `hitchpost/1` will. The MCP threat taxonomy supports the gateway's explicit-confirmation rule (FR-GATE-06). Adoption is R-25 in the [RAID log](33-raid-log.md) and is measured by the release criteria (independent implementations, gateway bookings).

### 13.5 What remains untested

No peer-reviewed evidence was found on: demand for agent-to-agent consultation between strangers; whether people will connect their own assistant to a third-party MCP server to book; or retention of an unpaid agent protocol. These are untested assumptions (A-12, R-25, R-27), decided by the pilot, not by literature.

## 14. Summary table

| Claim in the package                                                | Where                | Evidence            | Strength             | Verdict                     |
| ------------------------------------------------------------------- | -------------------- | ------------------- | -------------------- | --------------------------- |
| A human gate on commitments increases acceptance of delegation      | ADR 0007             | [S4], [S2]          | 1                    | Supported                   |
| The gate alone produces calibrated trust                            | 14                   | [S1], [S2], [S3]    | 1, 4                 | Mixed                       |
| Agents automate search and proposal; humans approve actions         | 10, 21               | [S5], [S6]          | 4 (framework)        | Supported                   |
| One approval per booking will not cause fatigue                     | 14                   | [S8], [S9], [S10]   | 3, 1 (clinical)      | Indirect                    |
| Reminders reduce no-shows                                           | FR-APP-08, P-29      | [S11], [S12], [S13] | 1                    | Supported                   |
| Booking through an agent reduces no-shows                           | 01 north star        | [S14], [S15], [S16] | 3                    | Mixed                       |
| Barbers will adopt agent-facing booking                             | A-02                 | [S17], [S18], [S19] | 3, 4 (other domains) | Untested                    |
| Only verified interactions can be rated                             | FR-RATE-01           | [S20], [S21], [S22] | 1, 2, 4              | Supported                   |
| Offer one slot, not a list                                          | 13, 14               | [S23] to [S27]      | 1, 2                 | Supported, with conditions  |
| Agent messages are untrusted; no model in the commit path           | NFR-SEC-01, ADR 0010 | [S28], [S29], [S30] | 4, 5                 | Supported                   |
| One neighbourhood, supply-first cold start                          | 03, A-08, R-12       | [S31], [S32], [S33] | 4, 5                 | Mixed                       |
| Agents can usefully negotiate and coordinate for their owners       | 01, 13, 24           | [S34], [S35], [S36] | 4                    | Indirect                    |
| Owners will share knowledge through their agent, per tier           | 01, 24 (L2)          | [S37] to [S41]      | 1, 3                 | Mixed, indirect             |
| People will consult (and might pay for) verified experts' knowledge | 24 (L3, L4)          | [S42], [S43]        | 3, 4                 | Indirect                    |
| An unpaid open protocol gets adopted                                | ADR 0020, R-25       | [S44], [S45], [S46] | 3, 4                 | Indirect; adoption untested |

## 15. Decisions the evidence changes

These are recommendations for the next change request; this document edits nothing else.

| ID   | Recommendation                                                                                                                                                                                                                                      | Evidence                       | Affects                                   |
| ---- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------ | ----------------------------------------- |
| EV-1 | Add appointment reminders to the v1 scope at P-29 (24 hours and 2 hours before the start, sent by the personal agent). It is the best-supported lever for honoured bookings. Adopted as FR-APP-08.                                                  | [S11], [S12]                   | 01, 05 (FR-APP-08), 14, 16                |
| EV-2 | Make the approval sheet require a glance at the facts: time and price are the largest elements and "Approve" never takes the default focus. Measure fatigue as approvals in under two seconds and median time to approve against the A-01 baseline. | [S2], [S8], [S10]              | 14, 15, 01 counter-metrics                |
| EV-3 | State the slot-selection duty: the offered slot must be the earliest that fits the request, never a shop-preferred one, and the rule is tested. Treat the offer as a default with endorsement power.                                                | [S27], [S24]                   | 07 business rules, 12 (dark patterns), 15 |
| EV-4 | Keep the gate scoped to commitments only; do not add approvals for holds, reminders or reads.                                                                                                                                                       | [S8], [S9]                     | 14, ADR 0007                              |
| EV-5 | Reword "agent booking reduces no-shows" anywhere it appears as a hypothesis, not an expected benefit, and measure it in the pilot against shop baselines.                                                                                           | [S14], [S16]                   | 01, 03                                    |
| EV-6 | When a language model is added, keep it out of the commit path entirely and red-team with adaptive attacks, not a fixed list.                                                                                                                       | [S29], [S30]                   | 12, ADR 0010, 19                          |
| EV-7 | Do not cite the cold-start or SMB-adoption literature as validation; A-02 and A-08 stay field-test assumptions.                                                                                                                                     | [S17] to [S19], [S31] to [S33] | 03                                        |
| EV-8 | Keep commitments out of free-form agent negotiation: agents exchange typed offers and a human approves; never let one agent's text change what another commits to.                                                                                  | [S34], [S35]                   | 13, 32, ADR 0012                          |
| EV-9 | Treat verified identity and profiles as the trust lever for consultation (L2) before any paid tier; keep L4 unpriced until adoption evidence exists.                                                                                                | [S42], [S43]                   | 24, ADR 0020                              |

## 16. Queries run (2026-11-09)

1. trust in automation calibration misuse disuse automation bias complacency
2. levels of automation human-in-the-loop model types and levels of human interaction with automation
3. alert fatigue override rates confirmation dialogs habituation
4. appointment reminders SMS effect on no-show rates meta-analysis
5. small business technology adoption barriers online booking systems SMEs
6. fake online reviews detection verified purchase review credibility consumer trust
7. choice overload meta-analysis number of options decision satisfaction
8. indirect prompt injection attacks LLM-integrated applications agents
9. two-sided platform cold start chicken-and-egg network effects launch strategy
10. when and why defaults influence decisions meta-analysis of default effects
11. consumers delegating purchase decisions to AI shopping agents trust willingness
12. online self-scheduling appointment booking effect on no-show rate
13. LLM agents communicating with other agents on behalf of users multi-agent negotiation delegation
14. willingness to share personal knowledge expertise with others online knowledge sharing motivation privacy
15. Model Context Protocol agent interoperability adoption standards
16. paid online question answering platforms willingness to pay for expert answers
17. privacy calculus personal AI assistant data sharing consent trust
18. open source protocol adoption network effects standards diffusion developers

Three results were screened and not cited: a conceptual framework on delegated commerce trust built on expert interviews that tests nothing (Wadwalkar, 2025); a systematic review of defaults in consumer choice (Manganari et al., 2025) and an experiment partitioning default effects (Dinner et al., 2011), both redundant with the stronger meta-analysis [S27]. From the network round, five more were not cited: a second organisational knowledge-sharing survey from the same sample as [S38] (Nguyen et al., 2021, posters and lurkers); an MCP architecture overview with no data (Ayyagari, 2025); a 2018 paid Q&A study in an unknown venue (Zhao et al.); and two open-source adoption papers that are a working paper and a game-theoretic model about organisational IT adoption rather than protocols (Miralles et al.; Katsamakas et al., 2019).

## 17. References

| Ref | Citation                                                                                                                                                                                                                                    | Link                                                                           |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| S1  | Wischnewski, M. et al. (2023). Measuring and Understanding Trust Calibrations for Automated Systems: A Survey of the State-Of-The-Art and Future Directions. _Proceedings of CHI 2023_.                                                     | [link](https://consensus.app/papers/details/4f1a681ff4fb5cbd98f61dda3decd987/) |
| S2  | Romeo, G. et al. (2025). Exploring automation bias in human–AI collaboration: a review and implications for explainable AI. _AI & Society_.                                                                                                 | [link](https://consensus.app/papers/details/c15457f004325789909055df8acbdd9d/) |
| S3  | Walker, F. et al. (2023). Trust in automated vehicles: constructs, psychological processes, and assessment. _Frontiers in Psychology_.                                                                                                      | [link](https://consensus.app/papers/details/86e5473a8d185634a62b45de524b6bc2/) |
| S4  | Balaskas, S. (2026). From Recommendations to Delegation: A Systematic Review Mapping Agentic AI in E-Commerce and Its Consumer Effects. _Information_.                                                                                      | [link](https://consensus.app/papers/details/c0a40f7150c2514c822fd3c6d45830e2/) |
| S5  | Parasuraman, R., Sheridan, T. B., Wickens, C. D. (2000). A model for types and levels of human interaction with automation. _IEEE Transactions on Systems, Man, and Cybernetics, Part A_.                                                   | [link](https://consensus.app/papers/details/dee512f82b2152fcaa28f37ea0a8367d/) |
| S6  | Kaber, D. (2018). Issues in Human–Automation Interaction Modeling: Presumptive Aspects of Frameworks of Types and Levels of Automation. _Journal of Cognitive Engineering and Decision Making_.                                             | [link](https://consensus.app/papers/details/d6800400670f56f5bdaf0b55aefae3c7/) |
| S7  | Liu, Y.-M. et al. (2025). Models of automation proportion in human-in-the-loop systems and operator situation awareness responses. _Ergonomics_.                                                                                            | [link](https://consensus.app/papers/details/8e411d3a3b2e5d2ba2ca5596e34705ad/) |
| S8  | Ancker, J. et al. (2017). Effects of workload, work complexity, and repeated alerts on alert fatigue in a clinical decision support system. _BMC Medical Informatics and Decision Making_.                                                  | [link](https://consensus.app/papers/details/67df189d6bf25136a9ebc8dfa22dba5f/) |
| S9  | Baysari, M. et al. (2017). Alert override as a habitual behavior: a new perspective on a persistent problem. _JAMIA_.                                                                                                                       | [link](https://consensus.app/papers/details/454b2848f81057c0a40f9873654fefc3/) |
| S10 | Ray, C. et al. (2026). Alert fatigue measurement in clinical decision support: a systematic review. _JAMIA_.                                                                                                                                | [link](https://consensus.app/papers/details/3dc0983f4b2854b3a978281af7800c5d/) |
| S11 | Boksmati, N. et al. (2016). The Effectiveness of SMS Reminders on Appointment Attendance: a Meta-Analysis. _Journal of Medical Systems_.                                                                                                    | [link](https://consensus.app/papers/details/eb643614a2f05985b899ca16b5c36c29/) |
| S12 | Werner, K. et al. (2023). Behavioural economic interventions to reduce health care appointment non-attendance: a systematic review and meta-analysis. _BMC Health Services Research_.                                                       | [link](https://consensus.app/papers/details/9d7b9976822c51dc8c9cf3efd4cc77c1/) |
| S13 | Tang, B. (2022). Effect of SMS reminders on Attendance Rates for Healthcare Appointments: A Systematic Review & Meta-Analysis. _Journal of Clinical Case Studies Reviews & Reports_.                                                        | [link](https://consensus.app/papers/details/bd93432053fa59729d702f8914f3292c/) |
| S14 | Kammrath Betancor, P. et al. (2025). Efficient patient care in the digital age: impact of online appointment scheduling in a medical practice and a university hospital on the "no-show"-rate. _Frontiers in Digital Health_.               | [link](https://consensus.app/papers/details/87c4f35e2cbe5364888b0c5ef4e99df6/) |
| S15 | Kammrath Betancor, P. et al. (2024). Efficient patient care in the digital age: Online appointment scheduling in an ophthalmology practice. _Digital Health_.                                                                               | [link](https://consensus.app/papers/details/2d3b883f9bcf51c2851f304058c4bc40/) |
| S16 | North, F. et al. (2021). The Effect of Automated Mammogram Orders Paired With Electronic Invitations to Self-schedule on Mammogram Scheduling Outcomes. _JMIR Medical Informatics_.                                                         | [link](https://consensus.app/papers/details/ce7b866ec5585b6ba0b25df966a09f3d/) |
| S17 | Trinugroho, I. et al. (2021). Adoption of digital technologies for micro and small business in Indonesia. _Finance Research Letters_.                                                                                                       | [link](https://consensus.app/papers/details/de3d8cb1d3cf5bb49b781ca6133ad594/) |
| S18 | Nazir, M. A. et al. (2021). Barriers to Adopting Electronic Commerce for Small and Medium-sized Enterprises in Emerging Economies. _EMAJ: Emerging Markets Journal_.                                                                        | [link](https://consensus.app/papers/details/dd069434db605e98874476160b63995b/) |
| S19 | Yadav, H. et al. (2022). Evaluation of Barriers in the Adoption of E-Commerce Technology in SMEs: A Fuzzy DEMATEL Approach. _Journal of Electronic Commerce in Organizations_.                                                              | [link](https://consensus.app/papers/details/ee4a2b77d9625712992c60a4684a7512/) |
| S20 | Orzan, M. et al. (2026). Fake Consumer Reviews in the Context of Trust, Detection, and Governance. _International Journal of Consumer Studies_.                                                                                             | [link](https://consensus.app/papers/details/f6536c3776b45fd29ec35db053d85491/) |
| S21 | Harrison-Walker, L. J. et al. (2023). Suspicion of online product reviews as fake: Cues and consequences. _Journal of Business Research_.                                                                                                   | [link](https://consensus.app/papers/details/bed73db595385fd2a1aa8e6295fd03d7/) |
| S22 | Hájek, P. et al. (2023). Fake review detection in e-Commerce platforms using aspect-based sentiment analysis. _Journal of Business Research_.                                                                                               | [link](https://consensus.app/papers/details/31f07bb647a751f3bb8114fefdd868e9/) |
| S23 | Scheibehenne, B. et al. (2010). Can There Ever Be Too Many Options? A Meta-Analytic Review of Choice Overload. _Journal of Consumer Research_.                                                                                              | [link](https://consensus.app/papers/details/2930f189fab95d3495ebbfedb94f142b/) |
| S24 | Chernev, A. et al. (2015). Choice overload: A conceptual review and meta-analysis. _Journal of Consumer Psychology_.                                                                                                                        | [link](https://consensus.app/papers/details/c7be5e074f57554893b5ee8df581e539/) |
| S25 | Haynes, G. A. (2009). Testing the boundaries of the choice overload phenomenon. _Psychology & Marketing_.                                                                                                                                   | [link](https://consensus.app/papers/details/76d5755c1c375230b3753453aef03736/) |
| S26 | Mari, A. et al. (2025). AI-Assisted Shopping on Voice Assistants: The Efficiency–Autonomy Consumer Decision Trade-Off. _Journal of Interactive Marketing_.                                                                                  | [link](https://consensus.app/papers/details/2907266f99f6537d8b441fba5317f30e/) |
| S27 | Jachimowicz, J. et al. (2019). When and why defaults influence decisions: a meta-analysis of default effects. _Behavioural Public Policy_.                                                                                                  | [link](https://consensus.app/papers/details/3acd0367c8105d88858871badac1257d/) |
| S28 | Greshake, K. et al. (2023). Not What You've Signed Up For: Compromising Real-World LLM-Integrated Applications with Indirect Prompt Injection. _Proceedings of the 16th ACM Workshop on Artificial Intelligence and Security_.              | [link](https://consensus.app/papers/details/667ace18801a59ce89d56d0e636d376c/) |
| S29 | Zhan, Q. et al. (2024). InjecAgent: Benchmarking Indirect Prompt Injections in Tool-Integrated Large Language Model Agents. arXiv (as listed by the tool).                                                                                  | [link](https://consensus.app/papers/details/1f22a6682586514aaa8f32ad3e8a9fb5/) |
| S30 | Zhan, Q. et al. (2025). Adaptive Attacks Break Defenses Against Indirect Prompt Injection Attacks on LLM Agents. Venue not given by the tool.                                                                                               | [link](https://consensus.app/papers/details/cadf2fb6ff3b5d138c4b896604a4e7ba/) |
| S31 | Stummer, C. et al. (2018). Platform Launch Strategies. _Business & Information Systems Engineering_.                                                                                                                                        | [link](https://consensus.app/papers/details/4a87b4e816f15ba48f8b00e81baed642/) |
| S32 | Veisdal, J. (2020). The dynamics of entry for digital platforms in two-sided markets: a multi-case study. _Electronic Markets_.                                                                                                             | [link](https://consensus.app/papers/details/b3c5e2b21a86516cbd5b0ccb3d473289/) |
| S33 | Solheim, M. T. et al. (2017). Launching a Two-sided Platform. Master's thesis (not peer reviewed).                                                                                                                                          | [link](https://consensus.app/papers/details/a7aa55954bd45d359257eb582dfca519/) |
| S34 | Bianchi, F. et al. (2024). How Well Can LLMs Negotiate? NegotiationArena Platform and Analysis. arXiv (as listed by the tool).                                                                                                              | [link](https://consensus.app/papers/details/c3035549186359fea8d749d9a7e97019/) |
| S35 | Lorenzoni, G. et al. (2026). LLM-X: A Scalable Negotiation-Oriented Exchange for Communication Among Personal LLM Agents. _Proceedings of the 2026 International Workshop on Agentic Engineering_.                                          | [link](https://consensus.app/papers/details/7acd63ee72f6515d8c89aab64aa3cc02/) |
| S36 | Gu, X. (2026). Task-Aware Delegation Cues for LLM Agents. arXiv (as listed by the tool).                                                                                                                                                    | [link](https://consensus.app/papers/details/ef921767e96c54b8bf4749a7e51cf805/) |
| S37 | Nguyen, T.-M. et al. (2019). Motivation and knowledge sharing: a meta-analysis of main and moderating effects. _Journal of Knowledge Management_.                                                                                           | [link](https://consensus.app/papers/details/3ffeada0d8e057b0a8f3ab07b1566b92/) |
| S38 | Nguyen, T.-M. et al. (2021). Motivation in organisational online knowledge sharing. _Journal of Knowledge Management_.                                                                                                                      | [link](https://consensus.app/papers/details/d98806b55a81509e8f615b2e0e37f117/) |
| S39 | Kumar, M. et al. (2021). 'Okay google, what about my privacy?': User's privacy perceptions and acceptance of voice based digital assistants. _Computers in Human Behavior_.                                                                 | [link](https://consensus.app/papers/details/a900d22c7d705068b0dc0fccee44c7ab/) |
| S40 | Ezzaouia, I. (2026). An extended privacy calculus model for AI-driven digital marketing: understanding consumers' data-sharing decisions. _Journal of Services Marketing_.                                                                  | [link](https://consensus.app/papers/details/a1869a6a9d3750109265482a5f89e3d3/) |
| S41 | Leschanowsky, A. et al. (2024). Evaluating Privacy, Security, and Trust Perceptions in Conversational AI: A Systematic Review. _Computers in Human Behavior_.                                                                               | [link](https://consensus.app/papers/details/0aef98235ff05fdd9fd7f0d673ca11a0/) |
| S42 | Zhang, F. et al. (2019). Why pay? An empirical study of paid-for SQA sites in China. _Online Information Review_.                                                                                                                           | [link](https://consensus.app/papers/details/c4c651beea3d5343872044fd12cfa9db/) |
| S43 | Sun, J. et al. (2022). Pay to view answers: determinants of listeners' payment decisions on social Q&A platforms. _Internet Research_.                                                                                                      | [link](https://consensus.app/papers/details/fdc923de1b1956a38b102281e404c20f/) |
| S44 | Bonaccorsi, A. et al. (2003). Why Open Source software can succeed. _Research Policy_.                                                                                                                                                      | [link](https://consensus.app/papers/details/93256d5e20c052929fd4e5d80113769f/) |
| S45 | Ehtesham, A. et al. (2025). A survey of agent interoperability protocols: Model Context Protocol (MCP), Agent Communication Protocol (ACP), Agent-to-Agent Protocol (A2A), and Agent Network Protocol (ANP). arXiv (as listed by the tool). | [link](https://consensus.app/papers/details/e298c9299fa8534aa3e7e237d07b9c1b/) |
| S46 | Hou, X.-Y. et al. (2025). Model Context Protocol (MCP): Landscape, Security Threats, and Future Research Directions. _ACM Transactions on Software Engineering and Methodology_.                                                            | [link](https://consensus.app/papers/details/9f6989663da2587caed613307dbae405/) |

## Revision history

| Version | Date       | Change                                                                                                                                                                                                                                                                                                                                                                                                  | Author      |
| ------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------- |
| 1.0     | 2026-11-09 | First baseline: rapid evidence review of nine design claims, 33 sources                                                                                                                                                                                                                                                                                                                                 | S. Jannisar |
| 1.1     | 2026-11-09 | Round 5: protocol first (no pricing), minimal MCP gateway in v1, final QA fixes, frozen for the Phase 2 spike. New section 13 on the network thesis (6 queries, 13 sources: agent-to-agent negotiation, knowledge sharing and privacy, paid Q&A, open-protocol adoption); EV-1 now matches P-29; EV-8 and EV-9 added; tracking parameters removed from all links; sections 13 to 16 renumbered 14 to 17 | S. Jannisar |
