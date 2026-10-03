# KAFENE Initial Information Architecture Research

**Status:** RESEARCH INPUT
**Research snapshot:** 2026-10-02
**Scope:** Initial EN/RU information architecture for practical questions about
living in the Republic of Cyprus. This document does not create or modify any
website taxonomy, editorial content model, Discourse category, tag, topic,
plugin, or setting.

This document is research input, not a canonical product specification or an
accepted product/architecture decision. The current website/forum boundary is
already established by DEC-002 and DEC-003 in `docs/00-DECISIONS.md`:

- the KAFENE website owns editorial knowledge such as guides, collections,
  journeys, and official-change entries;
- Discourse owns forum/community discussions, questions, answers, users, and
  moderation.

The Discourse feasibility spike is complete. Its measured results are evidence,
not pending architecture authority. ADR-001 remains an active draft that must be
rewritten; this research neither accepts nor amends it.

## 1. Executive findings

The public evidence supports a small number of broad, durable user-intent
spaces rather than a long directory of Cyprus subjects. Across current forum
threads, expat guide libraries, Russian-language resources, Reddit discussions,
and official service navigation, the most persistent needs are:

1. moving, immigration, residence, and citizenship;
2. renting, buying, maintaining, and paying for a home;
3. employment, business, tax, banking, and social insurance;
4. healthcare, GeSY, and insurance;
5. schools, childcare, and family administration;
6. driving, vehicles, and public transport;
7. everyday administration and finding local services.

The recommended launch IA therefore has **seven broad user-intent domains**,
with no launch subcategories. EN and RU should use the same conceptual spine so
that navigation and cross-language pairing remain intelligible, but they should
not receive identical seed content or editorial emphasis.

The recommendation can inform two distinct surfaces without making them the
same taxonomy:

- **Website/editorial taxonomy:** shared product entities and editorial
  selection are localized for RU/EN. The website does not require two
  independently evolving editorial content trees.
- **Forum/community taxonomy:** RU and EN community trees remain separate in
  Discourse. The seven domains may inform their categories, tags, and
  cross-language topic-space mapping.

The strongest cross-language difference is not the existence of the core
intents; it is the route through them:

- The indexed RU landscape is weighted toward third-country-national residence
  routes, foreign-interest-company employment, apostilles and translations,
  Russian-facing banking/payment constraints, licence conversion, and
  Russian/international schooling—often with Limassol as the local context.
- The indexed EN landscape is more mixed. Recent threads show EU mobility and
  non-EU questions, but also a pronounced UK/post-Brexit, pension/retirement,
  long-term home ownership, MEU-status, and older-driver administration cohort,
  with Paphos and eastern Cyprus more visible than in RU sources.

City is usually a facet of another need—not a need category. A Limassol rent
question, a Paphos hospital question, and a Larnaca school question should live
with housing, health, and family respectively and carry controlled location
metadata. Separate city categories would split thin launch traffic and make
island-wide answers harder to find.

Likewise, relocation checklists, first-month plans, leaving-Cyprus checklists,
and procedural explainers are guide/topic types. Pets are a meaningful but
contingent cross-cutting need. Utilities and local recommendations recur, but
are not large enough to justify separate launch categories. These should be
handled through guide types and controlled tags inside broad domains.

The conclusion is deliberately an IA research recommendation, not a product or
Discourse decision. Separate EN/RU trees apply to forum/community content. The
website/editorial layer instead uses shared product entities and editorial
selection with RU/EN localization, while permitting language-specific content
where the underlying audience, legal route, or evidence differs.

## 2. Source landscape reviewed

### Method

This was a directional, source-triangulated review, not a population survey or
keyword-volume study. Evidence was treated as stronger when an intent appeared
in more than one of these forms:

- repeated recent questions or replies;
- a stable navigation section on more than one community/guide platform;
- a substantial procedural branch in an official service taxonomy;
- the same need appearing in both EN and RU sources;
- a multi-step or high-consequence task that predictably generates follow-up
  questions.

A publisher's category is evidence of supplied content, not automatically of
user demand. A single forum's topic count is also not comparable with another
site's count. Counts and examples below are used as directional signals only.

### Russian-speaking communities, forums, and guides

- **R1 — [Emigrio Cyprus](https://emigrio.cy/):** its current navigation groups
  migration, finance/tax, legal questions, cars/transport, housing, education,
  work, health, children, pets, business, post, and household questions. This
  is useful evidence of the breadth of RU practical needs, but not of relative
  volume.
- **R2 — [CYPRUS FAQ — Republic of Cyprus](https://www.cyprus-faq.com/ru/south/):**
  a current RU question/guide library. At review time it exposed ten banking
  questions, six real-estate questions, 33 medical questions, 15 education
  questions, and 72 transport/vehicle questions. Its visible questions include
  Russian-bank/card access, transfers, rent, electricity connection, GeSY,
  private insurance, Limassol schools, public transport, and vehicle admin.
  These are content-supply counts, but the granularity is a strong signal of
  repeated procedural demand.
- **R3 — [Forum.cy RU](https://forum.cy/ru/):** an important negative example.
  It created many narrow sections—children, immigration, events, classifieds,
  property, education, medicine, sport, cars, animals, and individual hobbies—
  while most displayed zero to a handful of topics. Its travel/news inventory
  dominated. This is direct evidence of the empty-section risk of copying a
  comprehensive directory into a cold-start forum.
- **R4 — [Expats Cyprus RU](https://expats.cy/ru/):** current RU living guides
  cover immigration, costs, driving, utilities, banking, healthcare, work,
  and schools. It is commercial/editorial evidence and was used for topic
  coverage, not as an authority for rules.
- **R5 — [ProKipr's Cyprus forum/community overview](https://prokipr.ru/forum.html):**
  describes recurring RU community subjects as immigration, employment,
  study, housing, medicine, and everyday prices. Its linked community material
  also frames visa and tax questions as daily repeats. The source is useful for
  discovery but weaker than first-party forum pages.

### English-speaking expat and community platforms

- **E1 — [Expat.com Cyprus forum](https://www.expat.com/en/forum/europe/cyprus/):**
  the current topic feed repeatedly surfaces residence renewals, 90/60-day
  rules, licence exchange and renewal, property purchase and management,
  utilities, pensions/tax, banking, healthcare, tradespeople, postal services,
  scams, car insurance, pet transport, and moving questions. Many recent
  threads have replies and visible views, making this the clearest current EN
  discussion sample in the review.
- **E2 — [Expat.com Cyprus guide](https://www.expat.com/en/guide/europe/cyprus/):**
  provides a broad guide library around relocation, housing, cost of living,
  healthcare, banking, work, education, and transport.
- **E3 — [AngloINFO Cyprus How To](https://angloinfo.com/cyprus/how-to-guides):**
  its mature taxonomy spans family, financial/legal, health, home, moving,
  transport, and work. Some individual pages are visibly legacy material, so
  the review uses the taxonomy as evidence and not its older procedural claims.
- **E4 — [CyExpats guide library](https://www.cyexpats.com/guides/):** 39 current
  guides across visas, before-you-move preparation, money/tax, living costs,
  housing, administration, healthcare, work/business, family, transport,
  culture, life stage, and leaving Cyprus. Its content architecture is strong
  evidence that checklists and life-stage journeys work as guide collections,
  not necessarily as forum categories.
- **E5 — [The Cyprus relocation guide — ReLoCyprus](https://www.relocyprus.com/en/guide):**
  a compact current library centred on permits, banking, housing, tax,
  healthcare, and schools. It reinforces the same high-consequence core.
- **E6 — [Expat Focus Cyprus guide](https://www.expatfocus.com/cyprus/guide):**
  a broader 54-topic moving/living library including property, health,
  education, animal welfare, and pet import.

### Reddit and other current discussion evidence

The review sampled indexed recent posts rather than treating Reddit as a
representative census. Useful current examples include:

- multi-intent relocation questions combining rent, bureaucracy, banking,
  healthcare, community, and pets in one thread
  ([moving to Limassol](https://www.reddit.com/r/cyprus/comments/1uw6hlo/moving_to_limassol_soon_advice_from_locals_recent/));
- current tax-residence uncertainty
  ([becoming a tax resident](https://www.reddit.com/r/cyprus/comments/1wt4lei/becoming_a_tax_resident_in_cyprus_any_tips_please/));
- GeSY/private-insurance trade-offs
  ([health insurance](https://www.reddit.com/r/cyprus/comments/1roykxe/can_anyone_suggest_a_proper_health_insurance/));
- non-Greek-speaking children entering state school
  ([school integration](https://www.reddit.com/r/cyprus/comments/1t64om7/sending_non_greek_speaking_children_to_state/))
  and childcare hours
  ([kindergarten schedule](https://www.reddit.com/r/cyprus/comments/1klu6uq));
- electricity costs
  ([current electricity bills](https://www.reddit.com/r/cyprus/comments/1uv5diz/what_are_you_currently_paying_for_electricity_in/));
- car dependence and weak public-transport usability
  ([public-transport discussion](https://www.reddit.com/r/cyprus/comments/1rrntgg/cyprus_last_in_use_of_public_transport_in_eu/))
  plus driving-licence conversion
  ([licence question](https://www.reddit.com/r/cyprus/comments/1jnxxoc));
- rental contracts intersecting with immigration evidence
  ([rent-deposit question](https://www.reddit.com/r/cyprus/comments/1k8dd9f)); and
- pet travel logistics
  ([airlines carrying pets](https://www.reddit.com/r/cyprus/comments/1l8p6zu)).

These discussions show why a single topic often needs one primary domain plus
several facets. They also show that cost of living and city choice are normally
comparison questions spanning multiple domains.

### Official Cyprus and government-service taxonomies

- **O1 — [Gov.cy services](https://www.gov.cy/en/services/):** the official
  portal groups services into business activity, citizens/day-to-day life,
  education, employment/insurance, health, property/taxation, welfare, and
  other state functions. It validates the durability of the proposed domains,
  but its ministry-shaped taxonomy is too broad and institutional for a
  community navigation model.
- **O2 — [Migration Department: visitors and family members](https://www.gov.cy/mip-md/en/documents/visitors-and-family-members/),
  [students](https://www.gov.cy/mip-md/en/documents/students/), and
  [family reunification](https://www.gov.cy/mip-md/en/documents/family-members-of-certain-third-country-nationals-that-are-legally-residing-in-cypurs-fr-family-reunification/):**
  the official material branches by legal status, purpose, and family
  relationship. Those dimensions should be structured facets inside one
  residency domain, not separate top-level categories.
- **O3 — [Road Transport Department: foreign licence conversion](https://www.mcw.gov.cy/mcw/rtd/rtd.nsf/All/AA805A89E5ED997BC225781C00296BCF?OpenDocument=&print=):**
  demonstrates the status-, country-, residence-, and document-dependent
  nature of a common transport task.
- **O4 — [GeSY beneficiary FAQ](https://www.gesy.org.cy/sites/Sites?d=Desktop&locale=en_US&lookuphost=%2Fen-us%2F&lookuppage=hiobeneficiariesregistrationfaq):**
  separates eligibility, enrolment, personal doctors, specialists,
  pharmaceuticals, tests, systems, and financing. It supports health as a
  durable domain while arguing against separate categories for each service.
- **O5 — [Business in Cyprus](https://www.businessincyprus.gov.cy/):** organizes
  the business lifecycle as plan, start, run/grow, fund, and exit, with permits
  by sector. Its [start-business checklist](https://www.businessincyprus.gov.cy/doing-business-in-cyprus/start-your-business/)
  also crosses company registration, tax, VAT, social insurance, premises, and
  hiring—evidence for keeping work, business, and money together at launch.
- **O6 — [Gov.cy school registration](https://www.gov.cy/en/services/ekpaideysh/eggrafh-se-sxoleio/):**
  confirms that school enrolment is a distinct recurring service journey.
- **O7 — [GOV.UK Living in Cyprus](https://www.gov.uk/guidance/living-in-cyprus):**
  not a Cyprus-government taxonomy, but a useful official guide for the EN/UK
  audience. It groups visas/residency, work, healthcare, driving, property,
  tax, pensions, and pets.

### Limitations

- Private Facebook and Telegram groups are central to both language communities
  but are poorly indexable; only public landing pages and references were
  available. Their internal message volume was not measured.
- Search-engine indexing, moderation rules, commercial SEO, and platform age
  bias the visible sample.
- Guide libraries often optimize for lead generation. Their presence is useful
  taxonomy evidence but not proof that their legal or financial detail is
  current.
- No KAFENE search logs, user interviews, support inbox, or launch-cohort survey
  exists yet. Priority is therefore qualitative and should be tested after
  launch.
- The authoritative sources reviewed primarily concern the Republic of Cyprus
  and the government-controlled areas. The product's treatment of Northern
  Cyprus remains an unresolved scope and jurisdiction question.

## 3. Recurring user-intent clusters

### Compact decision table

Priority meanings: **P0** = must be easy to find at launch; **P1** = launch
support, but may live in a broader category; **P2** = prepare metadata/guide
coverage and promote only after measured demand. “Category” means one of the
seven recommended broad domains at the conceptual level. On the website it may
be navigation or editorial metadata; in the forum it may map to a Discourse
category. A guide is a website/editorial content type by default, not a forum
navigation branch.

| User intent | Evidence | Category/tag/guide | EN/RU relevance | Launch priority | Notes |
|---|---|---|---|---|---|
| Choose a visa/residence route; apply, renew, reunify family, or naturalize | R1, R2; E1, E4, E5; O2; recent Reddit move threads | **Category:** Moving & Residency; legal-context and route tags; canonical guides | EN **high**; RU **very high** | P0 | High consequence and repeated. Commercial relevance: immigration/legal services. Do not split each permit into a category. |
| Prepare documents, apostilles, translations, appointments, and first-month tasks | R1, R2; E4; O2 | **Guide/checklist** in Moving & Residency; `new-arrival`/route tags | EN high; RU very high | P0 | RU sources show heavier document-legislation friction. A checklist is a reusable topic type, not a section. |
| Find a rental; understand lease, deposit, landlord, repairs, and move-in evidence | R1, R2; E1, E2, E4; Reddit rent-deposit thread | **Category:** Housing & Home; `renting`, location tags | EN very high; RU very high | P0 | Often coupled to residence proof and utilities. Strong property/insurance/service commercial intent. |
| Buy/sell property; title deeds, fees, developers, ownership and maintenance | R2; E1, E3, E5; O1 | Housing & Home; `buying-property` tag; due-diligence guides | EN very high; RU high | P0 | EN forum sample shows especially visible long-term owner issues. Keep rent and purchase together until volume supports a split. |
| Compare cities, neighbourhoods, rent, schools, commute, and lifestyle | R1, R2; E4, E5; repeated Reddit relocation threads | **Location tag + comparison guide**, not category | EN high; RU high | P0 | Cross-domain by nature. City sections would duplicate and fragment answers. |
| Find work; understand salaries, contracts, permits, rights, and qualifications | R1, R2; E2, E4; O1/O2; current RU relocation discussions | **Category:** Work, Business & Money; `employment` tag | EN high; RU very high | P0 | RU demand is often tied to foreign-interest-company/IT relocation; EN includes local jobs and qualification recognition. Recruitment relevance. |
| Start/run a company or become self-employed | R1, R2; E4; O5 | Work, Business & Money; `business`/`self-employed` tags; lifecycle guides | EN high; RU very high | P0 | High-value but too interdependent with tax, banking, payroll, and residence to isolate at launch. Accounting/legal relevance. |
| Establish tax residence; file tax; understand non-dom, payroll, VAT, and social insurance | R1, R2, R5; E1, E4, E5; O1/O5; current Reddit tax thread | Work, Business & Money; `tax` or `social-insurance` tags; verified guides | EN very high; RU very high | P0 | High-consequence and freshness-sensitive. Strong professional-service relevance; requires source/date metadata. |
| Open/use a bank account; payments, cards, FX, transfers, and proof of funds | R2; E1, E4, E5; Reddit moving threads | Work, Business & Money; `banking-payments` tag; task guides | EN high; RU very high | P0 | RU has distinct sanctions/card/transfer friction; do not assume EN answers transfer cleanly. Banking/FX commercial relevance. |
| Register for and navigate GeSY; choose doctors; compare private insurance; use pharmacies/emergency care | R1, R2; E1, E2, E4; O4; current Reddit health threads | **Category:** Healthcare; eligibility/insurance tags; canonical guides | EN very high; RU very high | P0 | Status-dependent, consequential, and locally variable. Insurance/provider relevance, with strict anti-promotion rules needed later. |
| Choose/register for school or nursery; language integration; childcare hours and activities | R1, R2; E2–E5; O6; current Reddit school threads | **Category:** Family & Education; `school`, `childcare`, location tags | EN high; RU very high | P0 | RU sources emphasize Russian/international schools; EN spans state/international choice. School/childcare commercial relevance. |
| Pregnancy, children, benefits, family administration, and elder/retiree needs | R1; E1, E3/E4; O1; EN retirement/pension threads | Family & Education for family; relevant health/money category plus life-stage tags for retiree/elder care | EN high; RU medium-high | P1 | Do not create “retirement” or “parents” silos; the underlying task should determine the category. |
| Exchange/get a licence; buy/import/register/insure/maintain a vehicle; MOT, road tax, fines | R1, R2; E1/E4; O3; current Reddit licence/import threads | **Category:** Transport & Driving; vehicle-task tags and guides | EN very high; RU very high | P0 | R2's unusually deep vehicle library and live EN discussions support a broad transport domain. Auto/insurance/repair relevance. |
| Plan buses, airport transfers, intercity travel, cycling, and car-free living | R2; E4; recent Reddit public-transport threads | Transport & Driving; `public-transport` tag; route/how-to guides | EN high; RU high | P1 | Recurring and Cyprus-specific, but not a separate category from vehicles at launch. |
| Connect/pay electricity, water, internet/mobile; handle post, CY Login, and routine public administration | R1/R2; E1/E3/E4; O1; electricity discussions | **Category:** Everyday Cyprus; `utilities`, `telecom`, `government-services` tags; task guides | EN high; RU high | P0 | Evidence spans many small but repeated tasks. Keeping them together avoids several empty admin categories. Utilities/telecom relevance. |
| Find a trustworthy local professional, tradesperson, interpreter, shop, or service | R1; E1/E3; Reddit relocation threads | Everyday Cyprus; `local-recommendation` topic type + location tag | EN high; RU high | P1 | High intent and commercial potential, but vulnerable to spam/self-promotion. Not a launch directory or marketplace. |
| Move with, care for, or travel with a pet | R1/R2; E1/E4/E6/O7; current Reddit pet threads | `pets` tag across Moving, Housing, Transport, and Everyday; pet-relocation guide | EN medium; RU medium-high | P1 | Salient when relevant but too narrow for a category. Pet transport, landlord rules, vets, and airlines cross domains. |
| Estimate cost of living and build a relocation budget | R1/R2; E1/E2/E4/E5; repeated Reddit threads | **Comparison/calculator/checklist guide** plus location and household tags | EN very high; RU very high | P0 | A synthesis across housing, transport, utilities, health, and family—not a discussion category. High affiliate risk. |
| Adapt culturally, learn Greek, make friends, or find community | R1; E1/E3/E4; relocation discussions | Everyday Cyprus; `community`/`greek-language` tags; guides/discussions | EN medium-high; RU medium | P1 | Real need, but should not displace practical launch coverage or become an unstructured “general” silo. |
| Leave Cyprus: terminate rent/utilities, tax and residence obligations, sell a car, transfer records | E4; scattered E1 threads; official service dependencies | **Leaving checklist guide** distributed through relevant domains; `leaving-cyprus` tag | EN medium; RU emerging | P2 | Important journey but insufficient launch conversation volume for a category. Commercial relevance to movers/tax advisers. |

## 4. Category vs tag vs guide analysis

### What deserves a category

A launch category should satisfy all of these conditions:

1. it represents an enduring user goal, not an institution or content format;
2. it can absorb several related intents without becoming a miscellaneous bin;
3. evidence appears across multiple independent source types;
4. both languages have credible demand, even if their sub-intents differ;
5. it can be seeded with enough useful material to avoid an empty first visit.

The seven proposed domains pass that test. They are broad enough to survive a
cold start and stable enough that a user can predict where to ask.

### What should be a tag

Tags are appropriate for dimensions that cut across domains or refine the same
intent:

- city/district;
- legal context and residence route;
- renting versus buying;
- employment, business, tax, banking, or social insurance inside the combined
  work/money domain;
- public transport versus vehicle administration;
- life stage or household circumstance, such as moving with children or pets.

Language is not a tag in the forum/community taxonomy; EN and RU forum trees
remain separate. Website/editorial knowledge follows a shared product-entity
and selection model with RU/EN localization rather than two independently
evolving content trees. City should not be inferred only from free text because
it is required product metadata where relevant.

### What should be a guide or topic type

The source landscape repeatedly uses the following forms successfully:

- step-by-step procedure;
- first-week/first-month/relocation/leaving checklist;
- eligibility decision tree;
- city or option comparison;
- cost/budget explainer;
- local recommendation request;
- question with a solved/accepted answer;
- time-sensitive alert or change note.

These forms can exist in any domain and therefore should not become categories.
Their implementation is surface-specific: guides, checklists, comparisons, and
change records belong to the website/editorial layer by default; questions,
discussions, local-recommendation requests, and solved answers belong to the
forum/community layer. The exact website content-storage model and the exact
supported Discourse category/tag/topic mapping remain open. This research does
not decide either implementation.

### Why no launch subcategories

Subcategories would encode assumptions that KAFENE has not yet validated.
Examples such as “pink slip,” “schools in Limassol,” “car import,” “tax,” or
“pets” are discoverable with controlled facets and guides. Creating them as
sections before traffic exists repeats the empty-section pattern visible on
Forum.cy.

A later split should require measured evidence, for example a sustained topic
flow, repeated navigation/search failure inside the parent, enough canonical
content to seed both language views, and a clear moderation owner. Raw topic
count alone is insufficient because one news importer or vendor can inflate it.

### Cold-start rule

Do not expose a recommended forum category in one community tree merely to
mirror the other language. Before production creation, define and meet a forum
seed threshold for each language—for example, useful discussion/solved
exemplars plus a clear incoming-question path. For website/editorial knowledge,
apply localization readiness to the shared entities and selection rather than
creating mirrored empty trees. If one language experience is not ready, keep
the conceptual mapping but stage publication rather than displaying an empty
shell.

## 5. EN/RU differences

### Shared demand

Both source landscapes strongly support residence, housing, tax/money,
healthcare, schools/family, vehicles/transport, utilities, and local services.
Both also show multi-intent relocation questions and significant city effects.
This justifies a common high-level spine.

### RU emphasis

The indexed RU landscape more often starts from a non-EU/third-country legal
position. High-salience needs include:

- visitor/pink-slip and employment routes, dependent family status, renewals,
  and limits on work;
- apostilles, certified translations, criminal-record certificates, and
  preparing family documents;
- opening and funding local accounts, Russian cards/transfers, proof of funds,
  and changing compliance practice;
- foreign-interest-company and IT/fintech employment, payroll, tax relief, and
  company formation;
- Russian-language or international schools and activities, especially around
  Limassol;
- converting Russian or other non-EU licences and navigating vehicle admin.

Editorially, RU launch coverage should therefore emphasize case-specific
status and source dates. A translated EN guide about an EU or UK route must not
be treated as a RU answer merely because the broad intent matches.

### EN emphasis

The indexed EN discussion landscape contains more visible:

- UK/post-Brexit residence and document questions, alongside EU and other
  non-EU routes;
- pensions, retirement, 60/183-day tax residence, overseas bank accounts, and
  estate planning;
- buying property, title/developer/complex-management issues, and maintaining
  an established home;
- MEU status changes and licence renewal/conversion, including older drivers;
- Paphos/eastern-Cyprus local-service and hospital questions;
- state-versus-international schooling and Greek-language integration.

EN should not be modeled as “tourists plus generic expats.” Its visible cohort
includes long-term residents and property owners with legacy/status-specific
administration.

### What should remain common

The seven-domain conceptual spine and topic-space identifiers should remain
common across surfaces. Website/editorial entities and selection should use
RU/EN localization, with distinct language-specific coverage when the evidence
or legal route requires it. Forum category names should be paired across the
separate EN/RU community trees. Controlled facets/tags should use one canonical
internal value with localized labels where the relevant platform supports it.
The examples, route emphasis, and seeding order may differ by language based on
actual demand.

These differences are observations about indexed sources, not claims about all
EN- or RU-speaking Cyprus residents. They need validation with KAFENE's own
data.

## 6. Recommended launch taxonomy

### Recommended conceptual spine: seven domains

1. **Moving & Residency / Переезд и ВНЖ**
   Entry, residence and work rights, renewals, family reunification,
   citizenship, documents, and arrival administration. Relocation checklists
   live here as guides.

2. **Housing & Home / Жильё и дом**
   Renting, buying, leases, landlords, title/property issues, repairs, moving
   house, and home-related setup. City and rent/buy are facets.

3. **Work, Business & Money / Работа, бизнес и деньги**
   Employment, salaries and rights, professional qualifications,
   self-employment, company operation, tax, social insurance, banking,
   payments, and transfers. This combination is intentionally broad at launch
   because official and user journeys cross these subjects repeatedly.

4. **Healthcare / Здоровье и медицина**
   GeSY eligibility and use, doctors and hospitals, pharmacies, private
   insurance, emergencies, dental/mental/reproductive health, and care access.

5. **Family & Education / Семья и образование**
   Schools, nurseries, universities, language integration, childcare,
   children's activities, family benefits/admin, and family life.

6. **Transport & Driving / Транспорт и вождение**
   Licences, buying/importing/registering/insuring/maintaining vehicles, road
   tax/MOT/fines, buses, airport/intercity transport, taxis, cycling, and
   car-free living.

7. **Everyday Cyprus / Повседневная жизнь на Кипре**
   Electricity/water, internet/mobile, post, CY Login and routine public
   administration, local-service recommendations, shopping and practical
   household questions, Greek-language/cultural adaptation, and community
   integration. This is a bounded practical catchment, not an unrestricted
   off-topic/general-chat category.

### Structural interpretation

This is **one seven-domain conceptual spine**, not fourteen independently
evolving domain models. It can inform two distinct surface taxonomies.

#### Website/editorial taxonomy

Website guides, journeys, collections, and official-change entries remain
shared product entities with RU/EN localization and a shared editorial
selection by default. The seven domains may provide navigation and metadata,
but this research does not require duplicated EN and RU editorial trees.
Language-specific items remain appropriate when the subject, legal route, or
evidence genuinely differs.

#### Forum/community taxonomy

The accepted product boundary retains separate EN/RU community trees in
Discourse. For that surface, the recommended shallow mapping is:

```text
EN content root
  ├─ Moving & Residency
  ├─ Housing & Home
  ├─ Work, Business & Money
  ├─ Healthcare
  ├─ Family & Education
  ├─ Transport & Driving
  └─ Everyday Cyprus

RU content root
  ├─ Переезд и ВНЖ
  ├─ Жильё и дом
  ├─ Работа, бизнес и деньги
  ├─ Здоровье и медицина
  ├─ Семья и образование
  ├─ Транспорт и вождение
  └─ Повседневная жизнь на Кипре
```

The language roots are forum/community boundaries, not two additional
user-intent categories. No deeper launch nesting is recommended. This mapping
is a research recommendation, not an implemented or accepted forum taxonomy.

### Launch priority within the seven

- **P0 seed first:** Moving & Residency; Housing & Home; Work, Business &
  Money; Healthcare; Transport & Driving.
- **P0 but cohort-dependent:** Family & Education. Evidence is strong, but each
  language needs relevant seed material rather than mirrored placeholders.
- **P1 bounded catchment:** Everyday Cyprus. Seed with utilities,
  government-service, telecom/post, and local-service exemplars so it does not
  become an unstructured “miscellaneous” feed.

## 7. Categories explicitly NOT recommended at launch

| Rejected launch category | Recommended treatment | Reason |
|---|---|---|
| Separate city categories (Limassol, Paphos, Larnaca, Nicosia, Famagusta area) | Controlled location tags and city-comparison guides | Most local questions belong to another intent; city categories fragment island-wide knowledge and will be uneven by language. |
| Pets | `pets`/`pet-owner` tag, relocation guide, topics in the relevant domain | Meaningful but contingent and cross-domain; high empty-section risk. |
| Utilities, telecom, post, or government admin as separate categories | Facet tags and guides in Everyday Cyprus or Housing | Each is recurrent but individually narrow at launch. |
| Local services / business directory / professionals | Recommendation topic type + location tag in Everyday Cyprus | High commercial intent but severe spam, self-promotion, verification, and freshness risks. The MVP explicitly excludes a marketplace. |
| Relocation, first-month, or leaving-Cyprus checklists | Guide/checklist topic types | A journey crosses categories; a category would duplicate domain knowledge. |
| Tax and banking as separate categories | Tags/guides inside Work, Business & Money | Both are strong intents, but splitting employment, company, tax, payroll, social insurance, and banking creates brittle boundaries during cold start. Re-evaluate with traffic. |
| Jobs board or classifieds | Not at launch; ordinary employment Q&A only | Requires moderation, expiry, employer verification, and anti-scam controls; not needed to answer practical questions. |
| News and events | Time-sensitive tags/curation later, if justified | News volume can swamp question-led knowledge, as the Forum.cy example shows. Events expire and require a dedicated freshness workflow. |
| Legal questions | Put the task in its substantive domain; mark professional-advice boundaries | “Legal” is an institutional lens, not the user's goal, and would duplicate immigration, housing, work, tax, and family. |
| Cost of living | Comparison/budget guide type with city and household tags | It is a synthesis across housing, transport, utilities, health, and family, not a conversation destination. |
| Retirement / digital nomads / students / parents | Life-stage or route tags plus targeted guides | These cohorts ask across many domains. Separate silos duplicate answers and make general guidance harder to maintain. |
| Travel/tourism, restaurants, nightlife, hobbies, sport | Defer; use Everyday Cyprus only for resident-practical questions | Large generic-tourism scope would dilute KAFENE's living-knowledge launch and invite many empty hobby sections. |
| Northern Cyprus | No launch category; resolve product/jurisdiction scope first | Different authorities, laws, services, currencies, and entry/property risks require explicit editorial and legal separation. Mixing answers would be unsafe. |
| General chat / off-topic | Do not launch as an IA pillar | Cold-start traffic should reinforce practical question coverage; unbounded chat weakens category predictability. |
| Guides as a standalone cross-domain forum category | Keep website guides organized by domain; use guide/content-type metadata on the website | Users navigate by need first. A separate forum guide silo would duplicate the website/editorial knowledge layer and the domain spine. |

## 8. Recommended controlled tag groups

For the forum/community surface, tags should be curated, localized, and
documented. For the website/editorial surface, the same controlled vocabulary
may be represented as metadata facets rather than Discourse tags. Avoid
free-form synonyms and nationality tags unless nationality is genuinely the
legal discriminator. The initial groups below are deliberately small; not every
content item or topic needs a value from every group.

### A. Location — maximum one where location matters

- `island-wide`
- `nicosia`
- `limassol`
- `larnaca`
- `paphos`
- `famagusta-area`
- `rural-villages`

Use district/area meaning consistently and localize the display label. Add
neighbourhood tags only after measured search/topic volume. Do not create a
free-form city tag for every village at launch.

### B. Legal context — maximum one primary context

- `cypriot-returnee`
- `eu-eea-swiss`
- `uk-post-brexit`
- `third-country-national`
- `family-member`

This group captures the legal frame, not ethnicity or language. “Russian” is
not a substitute for third-country-national status, and some RU users are EU
citizens.

### C. Residence route — one when applicable

- `visitor-pink-slip`
- `employment-permit`
- `digital-nomad`
- `student-residence`
- `family-reunification`
- `permanent-residence`
- `citizenship`

Route names must be reviewed against current official terminology before
implementation. A route tag never makes community advice authoritative.

### D. Domain facets — restricted to relevant categories

- Housing: `renting`, `buying-property`, `landlord-tenant`, `home-maintenance`
- Work/money: `employment`, `self-employed`, `business`, `tax`,
  `social-insurance`, `banking-payments`
- Health: `gesy`, `private-insurance`, `finding-care`, `emergency-care`
- Family: `school`, `childcare`, `higher-education`, `family-benefits`
- Transport: `driving-licence`, `buying-selling-vehicle`, `vehicle-import`,
  `vehicle-admin`, `public-transport`
- Everyday: `utilities`, `telecom`, `post`, `government-services`,
  `local-recommendation`, `greek-language`

These are not hidden subcategories. They are filters that may later earn a
subcategory only after measured demand and a content/moderation readiness
review.

### E. Household/life stage — up to two

- `with-children`
- `student`
- `retiree`
- `pet-owner`
- `new-arrival`
- `leaving-cyprus`

### F. Topic kind — exactly one if the platform mapping supports it

- `question`
- `guide`
- `checklist`
- `comparison`
- `local-recommendation`
- `change-alert`

On the forum, topic kind may ultimately be implemented as a native topic type,
category setting, tag group, or supported custom field. On the website, guide,
checklist, comparison, and change are editorial content types. This research
does not choose either implementation mechanism. `last_verified`,
`source_status`, paired-content identity, and canonical status are system
metadata, not user-applied tags.

## 9. Open questions / areas needing later validation

1. **KAFENE search and topic data:** Which intents generate searches with no
   useful result, repeated questions, or miscategorization after launch?
2. **Launch cohort mix:** How many initial EN users are UK retirees/owners,
   EU movers, non-EU employees, students, or local Cypriots? How many RU users
   are company-sponsored employees, visitors, EU citizens, families, or
   business owners?
3. **Private-community validation:** Do sampled Telegram/Facebook groups show
   the same priority order, especially for RU banking, doctors, schools, and
   local-service recommendations?
4. **Seed readiness:** What minimum localized website/editorial inventory and
   forum discussion/solved-topic inventory are required before each surface is
   visible in each language experience?
5. **Work/business/money split:** Does measured traffic later justify separate
   “Money & Tax” and “Work & Business” categories, or do cross-cutting journeys
   continue to favor one parent?
6. **Everyday Cyprus boundary:** Can moderation keep it practical and
   searchable, or does local-services volume justify a later controlled split?
7. **City granularity:** Are district tags sufficient? Only add neighbourhood
   metadata after search logs show repeated ambiguity.
8. **EN/RU pairing:** Which website guides should be localizations of one shared
   editorial entity, which require different legal-route coverage, and which
   forum topics need explicit cross-language linkage?
9. **Authority and freshness:** Which domains require mandatory official
   sourcing, `last_verified`, warnings, or professional review—especially
   immigration, tax, legal, medical, and property content?
10. **Commercial-content governance:** Before enabling business participation,
    define disclosure, self-promotion, referral, ranking, conflict-of-interest,
    provider-verification, scam-reporting, and expiry rules.
11. **Northern Cyprus scope:** Decide whether it is excluded, separately
    governed, or supported with explicit jurisdiction metadata. Do not mix it
    into Republic of Cyprus procedural guidance by default.
12. **Platform mapping:** The feasibility spike is complete and DEC-002/DEC-003
    already establish the website/forum boundary. Validate the recommended
    taxonomy separately against the future website content/navigation model and
    supported Discourse categories, tag groups, solved-Q&A, permissions,
    search, and metadata behavior. This IA does not resolve those implementation
    questions or replace the required rewrite of ADR-001.
13. **User validation:** Run EN and RU card sorting plus a small findability
    test using realistic questions before creating the production structure.
    Test whether users can place multi-intent questions consistently and whether
    the seven labels translate naturally.
14. **Promotion rule:** Review at 60–90 days using topic volume, unanswered
    rate, search exits, tag use, duplicate rate, and moderation burden. Promote
    a tag to a subcategory only when the split improves findability and both
    language/content readiness are understood.

---

## Proposed launch taxonomy — RECOMMENDED / NOT YET IMPLEMENTED

**Seven top-level user-intent domains per language experience:**

1. Moving & Residency / Переезд и ВНЖ
2. Housing & Home / Жильё и дом
3. Work, Business & Money / Работа, бизнес и деньги
4. Healthcare / Здоровье и медицина
5. Family & Education / Семья и образование
6. Transport & Driving / Транспорт и вождение
7. Everyday Cyprus / Повседневная жизнь на Кипре

**No launch subcategories.** On the website/editorial surface, use the domains
for navigation/metadata and keep guides, checklists, comparisons, and changes as
localized editorial content types. On the forum/community surface, use the same
conceptual domains within separate EN/RU trees, with controlled tags for
location, legal context, residence route, domain facets, and life stage; keep
local-recommendation requests and solved questions as forum topic types.

**RESEARCH INPUT / NOT YET IMPLEMENTED.** The website/forum boundary is already
accepted by DEC-002/DEC-003, but neither a production website taxonomy nor a
Discourse production structure should be created from this document until the
relevant surface mapping, seed/readiness gate, and EN/RU user validation are
completed. This document does not make that product decision.
