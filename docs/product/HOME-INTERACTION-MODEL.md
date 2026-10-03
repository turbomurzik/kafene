# KAFENE Home Interaction Model

**Status:** ACTIVE DRAFT

## Purpose

Define the MVP behavior of the KAFENE homepage/dashboard before frontend
implementation.

This document covers interaction mechanics only:

- what each homepage block represents;
- where its content comes from in MVP;
- how items are selected;
- where clicks go;
- how the block is updated;
- what happens when data is missing.

It does **not** define:
- final visual design;
- frontend technology;
- automated News ingestion;
- automated official-source monitoring;
- custom Ask KAFENE;
- Jev/reranking;
- final city-services/business architecture.

## Product boundary

KAFENE has two connected product surfaces:

### KAFENE website

Owns:
- homepage/dashboard;
- collections/hubs;
- journeys;
- standalone guides;
- official-change entries;
- later News/city discovery;
- search;
- later custom Ask KAFENE.

### KAFENE forum / Discourse

Owns:
- questions;
- discussions;
- replies;
- user/community experience;
- moderation/community mechanics.

The homepage may surface forum activity, but it is not a forum homepage and must
not collapse editorial knowledge into Discourse.

## Homepage objective

The homepage should answer four user needs quickly:

1. What matters in Cyprus right now?
2. Where do I start for a common life task?
3. What is the community discussing?
4. What has officially changed?

The homepage is a living Cyprus dashboard, not a category index.

## Primary entry interaction

### Hero / search

**Purpose**

Let the user express a practical Cyprus question or intent immediately.

**MVP source**

Static product UI plus existing search capability.

**Interaction**

Primary input:
> What do you want to know about Cyprus?

Primary action:
- submit to KAFENE search.

Secondary navigation may expose:
- Guides;
- Forum;
- Cities.

**MVP boundary**

Do not present custom Ask KAFENE as available until its own architecture and
answer-layer behavior are implemented.

**Fallback**

Search remains available even if all dynamic homepage blocks fail.

---

## Block 1 — What matters now

### Purpose

Editorially surface a small set of timely, high-value Cyprus topics that deserve
attention now.

Examples:
- Tax 2026;
- school enrollment period;
- residence-permit renewal season;
- a material official process change.

### MVP source

Manual/editorial KAFENE content.

No automated news feed or official-source watchdog is required for MVP.

### Selection

Editorial selection using:
- practical importance;
- timeliness;
- broad relevance;
- confidence that KAFENE has useful destination content.

Target: 4–6 items.

### Default click target

A KAFENE collection/hub page.

A large editorial card should not default directly to a Discourse topic.

### Optional secondary actions

A card may expose separate links to:
- a canonical guide;
- a verified change entry;
- a relevant forum discussion.

### Update logic

Manual editorial update.

Cards may use validity windows:
- `valid_from`;
- `valid_until`.

### Fallback

If no timely editorial items are available, show a smaller evergreen set of
high-value collections instead of inventing freshness.

---

## Block 2 — Start here

### Purpose

Help users enter KAFENE through common life journeys rather than forum taxonomy.

### MVP source

Curated static/managed journey definitions.

Initial examples:
- Moving to Cyprus;
- Residence permit;
- Buying a car;
- Child / school;
- Starting a company;
- Buying property.

### Selection

Stable editorial set.

This block changes rarely.

### Click target

Dedicated KAFENE journey page.

A journey may link onward to multiple:
- guides;
- collections;
- official changes;
- forum discussions.

### Update logic

Manual product/editorial maintenance.

### Fallback

Keep the stable journey set. Do not replace it with forum categories.

---

## Block 3 — Discussed now

### Purpose

Show active community conversations without turning the homepage into a forum
index.

### MVP source

Discourse API.

### Candidate inputs

Use available topic metadata such as:
- recency;
- replies;
- views;
- unique participants where available;
- solved/answered state where relevant;
- optional editorial boost.

### MVP ranking rule

Use a simple deterministic ranking combining activity and recency.

Exact weights are implementation detail and should be tuned only after observing
real traffic.

### Deduplication

Do not surface the same underlying subject prominently in both:
- "What matters now"; and
- "Discussed now"

unless the duplication is intentional and provides different value.

If an editorial card already dominates a topic, prefer another community topic.

### Click target

Directly to the Discourse topic.

This is the main homepage block where a primary click may intentionally leave the
KAFENE knowledge surface and enter the forum.

### Update logic

Automatic from Discourse API.

### Fallback

If ranking data is unavailable:
- show latest active discussions;
- if Discourse is unavailable, hide the block rather than display stale invented
  activity.

---

## Block 4 — What changed

### Purpose

Surface verified official changes that affect practical guidance.

This is not generic news.

### MVP source

Manual/editorial verified change records.

Automation of official-source monitoring is explicitly deferred.

### Content rule

A change item should represent a verified change in:
- law;
- government rule;
- administrative procedure;
- form;
- tariff;
- filing deadline;
- official requirement;
- other authoritative process.

### Minimum record

Each change entry should contain:
- title;
- short summary;
- affected guide/topic;
- effective date where known;
- detected/published date;
- source;
- verification state.

### Selection

Prefer:
- recent;
- material;
- user-relevant;
- guide-affecting changes.

### Click target

Default:
- KAFENE change detail / affected guide context.

Where useful, link directly to the affected canonical guide.

### Update logic

Manual/editorial for MVP.

### Fallback

Hide the block if there are no verified current changes.

Do not fill it with general news.

---

## Block 5 — Popular guides

### Purpose

Provide direct access to high-utility canonical KAFENE knowledge pages.

### MVP source

Managed guide catalogue plus simple usage/editorial signals.

### Selection

MVP may combine:
- editorial priority;
- page traffic where available;
- recurring practical demand.

### Click target

Standalone KAFENE guide page.

### Update logic

Mostly automatic from usage once analytics exist, with editorial override.

### Fallback

Use an editorially curated list of high-value guides.

---

## Block 6 — New questions

### Purpose

Surface fresh community questions that may need answers.

### MVP source

Discourse API.

### Selection

Prefer:
- recent questions;
- low-answer / unanswered topics;
- legitimate practical Cyprus questions.

Avoid duplicating the same item already shown in "Discussed now".

### Click target

Directly to the Discourse topic.

### Update logic

Automatic from Discourse API.

### Fallback

Hide if no suitable fresh questions exist.

---

## Block 7 — Cities

### Purpose

Provide geographic entry points without creating separate city forums.

### Product rule

A city is a content dimension, not a separate forum taxonomy.

Dedicated URLs such as:
- `/limassol`;
- `/nicosia`;
- `/larnaca`;
- `/paphos`;

may exist as city-scoped landing pages.

### MVP interaction

Clicking a city opens a KAFENE city landing page.

The page may compose city-scoped content from the same product model, for
example:
- relevant guides;
- relevant discussions;
- verified local changes;
- later local News.

### Important boundary

This draft does **not** finalize the exact city module set.

City-specific businesses/services remain deferred and must not be smuggled into
the MVP homepage implementation.

### Forum rule

A city landing page does not create a parallel city forum.

Forum discussions remain in the shared Discourse community and may be tagged or
associated with city metadata.

---

## Forum entry

The homepage must include an explicit route to the full forum/community surface.

Forum access should be visible, but the homepage should not behave like a skin
over Discourse.

Possible labels:
- Forum;
- All discussions;
- Ask the community.

Exact copy is a UI decision.

---

## Collection / hub interaction model

Large editorial cards default to KAFENE collection/hub pages.

Example:

`Tax 2026`

Hub may contain:
- short current summary;
- canonical guides;
- verified changes;
- current forum discussions;
- source/freshness information;
- later Ask KAFENE entrypoint.

This avoids forcing one editorial concept into either:
- one guide; or
- one forum topic.

---

## Guide interaction model

A KAFENE guide is a standalone knowledge page.

A guide may show:
- current answer;
- last verified;
- sources;
- requirements;
- steps;
- cost/timing where applicable;
- verified recent changes;
- relevant community discussion link.

Forum discussion is contextual supporting experience, not the guide body.

---

## Cross-surface linking rules

### Website -> Forum

Use when:
- community experience adds value;
- users may want edge cases;
- users may want to ask follow-up questions.

### Forum -> Website

Use when:
- a canonical guide exists;
- an official/current answer should be visible;
- a discussion risks repeating outdated procedural advice.

### Default principle

Knowledge pages remain primary for canonical practical guidance.
Forum remains primary for lived experience and discussion.

---

## Homepage card model

MVP editorial cards may use:

- `title`
- `subtitle`
- `type`
- `language`
- `priority`
- `status`
- `image_or_icon`
- `destination`
- `related_guide_ids`
- `related_topic_ids`
- `city`
- `valid_from`
- `valid_until`
- `manual_boost`

This is a product-level field model, not yet a required database schema.

Do not create a persistence layer solely because this document lists fields.

---

## Homepage deduplication rules

1. Do not show the same destination twice in adjacent homepage blocks.
2. If "What matters now" contains a major topic, suppress near-duplicate
   "Discussed now" items unless community discussion adds distinct value.
3. "New questions" should not repeat topics already chosen for "Discussed now".
4. "What changed" should not duplicate generic news treatment; it exists only for
   verified official changes.
5. Multiple blocks may reference the same broad subject only when their role is
   clearly different.

---

## Freshness / provenance rules

MVP must not imply automated freshness where none exists.

For editorial knowledge/change content, show provenance/freshness only when
known, for example:
- last verified;
- effective date;
- source link;
- verification state.

Forum activity timestamps come from Discourse.

Do not label content "current" merely because it is recently published.

---

## Language behavior

The homepage supports separate EN/RU presentation.

MVP principle:
- interface/content may be localized;
- forum communities remain separate EN/RU trees;
- homepage should not merge EN/RU discussions into one mixed feed by default.

Cross-language semantic retrieval remains a separate capability and does not
change homepage community-tree separation.

---

## MVP data dependencies

The homepage may depend only on:

1. editorial/manual KAFENE content;
2. managed/static guide and journey content;
3. Discourse API;
4. simple analytics if available.

The homepage MVP does **not** depend on:
- automated news aggregation;
- official-source polling/diffing;
- external vector database;
- custom Ask KAFENE;
- Jev;
- autonomous content generation.

---

## Failure behavior

The homepage should degrade gracefully.

- Editorial blocks: use curated fallback or hide.
- Discourse blocks: hide if API unavailable.
- Search: remains the primary stable interaction.
- Do not substitute synthetic "live" data to make the page look populated.

---

## Explicitly deferred

Not part of this MVP model:

- RSS/news ingestion;
- cross-outlet event deduplication;
- automated news summarization;
- official-source watchdog;
- automated change detection/diff;
- automated guide patching;
- custom Ask KAFENE answer orchestration;
- Jev reranking;
- city business/service directory;
- final personalization for returning users.

---

## Open decisions

Still unresolved after this draft:

1. exact city landing-page module set;
2. exact deterministic ranking formula for "Discussed now";
3. exact CMS/content-storage implementation for guides, journeys and editorial
   cards;
4. exact frontend stack;
5. whether returning users later receive adaptive homepage ordering.

These are not blockers for agreeing the MVP interaction model itself.

## Acceptance condition

This document becomes CANONICAL only after explicit review/acceptance.

Until then, it is an ACTIVE DRAFT and must not silently override
`docs/00-DECISIONS.md` or `docs/STATUS.md`.
