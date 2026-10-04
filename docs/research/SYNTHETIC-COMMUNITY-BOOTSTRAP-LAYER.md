# Synthetic Community Bootstrap Layer

**Status:** RESEARCH INPUT

## Purpose

Define how KAFENE can launch a useful, active-looking forum before an organic community is large enough to sustain continuous discussion.

The accepted product concept is a temporary **Synthetic Community Bootstrap Layer**: a controlled population of persistent AI personas operating inside Discourse during cold start.

This document starts the research workstream. It does not yet define the implementation.

## Product intent

The bootstrap layer exists to solve one problem:

> A structurally empty forum discourages the very users needed to make it non-empty.

Synthetic participants should therefore make early KAFENE feel inhabited, responsive and socially legible while the real community is still forming.

The layer is temporary. Its expected share of visible activity should decline as organic participation grows.

## Disclosure boundary

Synthetic accounts are allowed to behave like ordinary community members, but each synthetic account must carry a persistent, visible provenance label in the UI.

Cyprus RU example:

> **ИИ-персонаж**

EN equivalent:

> **AI persona**

The label should be clear without dominating the interface. It must not be removable by the persona.

A fuller profile explanation may state that the account is a synthetic participant operated by KAFENE for community bootstrap.

## Allowed behavioral scope

Research should assume that a synthetic persona may use the ordinary user action surface, subject to the same moderation and platform rules as users.

This includes, where useful:

- creating topics;
- asking questions;
- replying;
- following up later;
- reacting / liking;
- quoting;
- linking to guides or other discussions;
- subscribing/following topics;
- returning to old threads;
- editing or correcting its own posts;
- disagreeing with other participants;
- changing its view over time;
- participating in RU or EN community spaces according to its persona;
- interacting with both humans and other synthetic personas.

Synthetic actions are real Discourse actions and may naturally contribute to ordinary forum counters. KAFENE should not separately invent counters that did not arise from actual platform events.

## Persona continuity

The layer must not be a collection of stateless prompt templates.

A synthetic persona should be capable of maintaining a durable internal line including:

- stable identity and display name;
- synthetic biography;
- locality;
- languages;
- occupation or life context;
- family/household context where relevant;
- recurring interests;
- areas of competence and ignorance;
- communication style;
- activity level and rhythms;
- recurring concerns;
- prior posts and commitments;
- relationships with other personas/users;
- remembered disagreements and agreements;
- changes in opinion;
- unresolved personal threads that may reappear later.

The research must determine which of these belong in explicit structured state, episodic memory, retrieval from forum history, or model-generated inference.

## Content quality boundary

Synthetic biography may be fictional because the account is visibly synthetic.

However, the system should not:

- impersonate a real person;
- fabricate claims attributed to real users;
- invent factual claims about Cyprus institutions, businesses or procedures as though verified;
- create fake testimonials for commercial partners;
- manufacture accusations about identifiable people;
- bypass ordinary moderation or commercial disclosure rules.

Practical or regulatory claims should be grounded in the same knowledge/source model used elsewhere by KAFENE.

## Social simulation questions

The research must answer at least:

1. How many personas are required for a forum to feel socially legible without looking mechanically populated?
2. What mix of lurkers, occasional posters, regulars and high-activity personas is believable?
3. How should activity vary by hour, weekday, language and topic?
4. How often should a persona decide not to respond?
5. What response-time distribution feels natural?
6. How should personas form relationships, recurring disagreements and topic affinities?
7. How much AI-to-AI interaction is useful before it becomes self-referential theatre?
8. How should new synthetic accounts appear over time?
9. How should synthetic personas react to a real newcomer?
10. How should the system avoid repetitive tone, vocabulary, agreement patterns and synchronized activity?
11. How should persona histories survive model changes and long gaps?
12. How should the layer degrade or retire personas as organic participation grows?

## Architecture questions

Research should compare at least these components:

- Persona Registry — stable identity and structured attributes.
- Episodic Memory — important past interactions/events.
- Forum History Retrieval — what the persona can recover from Discourse.
- Social Graph — relationships, familiarity, affinity/conflict.
- Activity Scheduler — whether/when a persona wakes up.
- Action Policy — read, ignore, react, reply, start topic, return later.
- Grounding Layer — access to KAFENE guides and verified information.
- Orchestrator — population-level coordination without centrally scripting every conversation.
- Moderation Boundary — rate limits, kill switches, topic restrictions and audit.
- Decay Controller — reduces synthetic share as real activity becomes self-sustaining.

No architecture is accepted yet.

## Research evaluation

The research should produce a reproducible evaluation plan.

Candidate measures include:

- persona consistency across time;
- duplicate/repetitive language rate;
- topic diversity;
- response-time distribution;
- synthetic-to-human interaction ratio;
- synthetic-to-synthetic interaction ratio;
- unresolved-thread return rate;
- rate of factual corrections;
- moderation incidents;
- user reply/conversion rate on seeded topics;
- proportion of synthetic activity over time;
- cost per useful forum interaction;
- human reviewer judgement of behavioral plausibility.

The objective is not to hide provenance. The objective is that, apart from the explicit AI-persona label, the accounts behave with the continuity and variation expected from persistent community members.

## Bootstrap / decay hypothesis

Working hypothesis for research:

1. At day zero, synthetic participants may supply most forum activity.
2. As real users arrive, synthetic personas should increasingly respond to and support human conversations rather than converse primarily with one another.
3. Once a category reaches a defined organic-activity threshold, synthetic initiation should decline sharply.
4. Mature categories may retain a small number of useful synthetic participants or retire them entirely.
5. The transition should be data-driven and reversible.

Exact thresholds remain an open research question.

## Deliverables before implementation

Before coding the layer, the research pass should produce:

1. persona state model;
2. social-graph model;
3. memory model;
4. activity/action policy;
5. population scheduler/orchestrator design;
6. grounding and moderation rules;
7. synthetic-account UI/provenance specification;
8. cold-start population model;
9. decay/retirement model;
10. evaluation protocol;
11. minimal Discourse implementation spike plan;
12. rough API/model-cost estimate.

## Current status

**Research authorized. Implementation not yet authorized.**
