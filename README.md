# Kakaw

*The ledger made lyrical.*

A ceremonial publication infrastructure that renders the historical record of Mesoamerican cacao as bilingual lyrical artifacts. Each artifact — a *stela* — pairs a single data point from the colonial-era archive (Mendoza Codex, Dresden Codex, archaeological record, ethnographic record) with its rendering in K'iche', Spanish, and English, anchored to a contemporary Maya cacao cooperative.

Sister project to **the-elder** ([the-elder.vercel.app](https://the-elder.vercel.app)), sharing infrastructure and lineage discipline but standing as its own ceremonial site.

---

## What this is

A static publication site. A growing archive. Each page is a single stela — screenshot-ready, share-ready, print-ready. The site does not converse. It declares.

A stela carries:

- **The data** — a verifiable historical fact from the colonial or pre-colonial record
- **The source** — the codex, volume, or archaeological context that supplies the fact
- **The rendering** — the fact rendered as ceremonial language in K'iche', Spanish, and English, in the syntactic discipline of Maya prayer
- **The contemporary anchor** — a named, currently-operating Maya cacao cooperative whose work continues the lineage the stela honors
- **The lineage attribution** — the advisory relationships under which the work was made

## What this is not

It is not generative poetry about cacao.
It is not translation.
It is not data visualization.
It is not a wellness platform, a chocolate brand, or an aestheticized product.

It is a computational restoration of the lyrical dimension to a historical record that has been read accountantly for 500 years.

---

## The load-bearing wall

The Mendoza Codex tribute lists, the carga counts, the bean-for-slave conversion tables, the botanical inventories — these are not dead data dressed up in poetic clothing for emotional palatability. They are documents whose original cosmological register was stripped out by the colonial gaze. The project's task is *recovery*, not invention.

The myth was always inside the ledger. The ledger pretended it wasn't.

Every architectural decision in this repository serves that single load-bearing claim.

---

## Applied Mythopoetics — what it is

This project sits within a category that has not yet been named in the public conversation: **Applied Mythopoetics — the production of mythologically-precise artifacts from verifiable historical, scientific, or cultural data, in service of cultural recovery rather than aesthetic decoration.**

The category has three criteria:

1. **The data is verifiable.** Each artifact is anchored to a citable source that an independent scholar could check. The mythopoetic register does not replace the citation; it carries it.
2. **The mythological register is lineage-pure.** The symbolic, metaphoric, and ceremonial vocabulary draws only from the tradition the data itself belongs to. A cacao stela operates in Maya cosmology, not in generic mystical register.
3. **The work serves recovery.** The artifact restores a register of meaning that was stripped from the source by the conditions of its preservation (colonial documentation, extractive scholarship, secular translation). It is not invention; it is recuperation.

Sister artifacts under this category include the AHAU AI Council of Voices (the-elder.vercel.app — Applied Mythopoetics in the divinatory register) and the *Ix K'ik' Awakens* screenplay (Applied Mythopoetics in the cinematic register).

Kakaw is one project within an emerging field. The "Volume I" framing is reserved until at least one additional public artifact under the same discipline has shipped; until then, this is simply the Kakaw project.

---

## The seven hardening principles

These hold for every stela without exception:

**1. Each stela carries its source.** No artifact appears without its data anchor as a structural element of the composition, not a footnote.

**2. Each stela carries the wound.** The colonial frame of the source document is named, never elided. Tribute is named as tribute. Extraction is named as extraction. Beauty does not soften brutality; it sharpens it.

**3. Each stela carries contemporary continuity.** The 1540 record and the present-day cooperative appear in the same composition. Past tense and present continuous in the same vessel.

**4. Each stela redirects.** The artifact's beauty becomes a named cooperative's distribution. Every stela links to a currently-operating Maya cacao cooperative with purchasing information. The artifact's success becomes the cooperative's success. Links route through stable kakaw-domain redirects, never raw external URLs (see "Cooperative redirect architecture" below).

**5. Each stela is lineage-pure.** No cross-traditional borrowing. No Rumi, no Tao, no Western mysticism, no wellness-literature voice. Only metaphors operative within the Popol Wuj, the codex tradition, the daykeeper vocabulary, and the documented ethnographic record of Maya ceremony. Enforced by an explicit Lineage Integrity Review pass before publication.

**6. Each stela is reviewable, correctable, and removable.** Every published artifact has a public correction log. The takedown protocol is faster than the publication protocol.

**7. Each stela names its authorial position.** This work does not claim the position of K'iche' authorship. It claims the position of K'iche'-mentored authorship working in service of the lineage. That position is named on every artifact.

---

## Architecture

### Stack: why Astro, not Next.js

The-elder is built on Next.js because it is a stateful, conversational, streaming experience. The framework's strengths — SSR, streaming SSE, server actions — directly serve the divinatory flow.

Kakaw is a static publication site. The artifacts are designed to be readable in 2046. The technology choices should favor *durability* over feature richness.

The build uses **Astro** (TypeScript, content collections, MDX support) because:

- It compiles to static HTML with zero JavaScript by default. A stela page is plain HTML that will render in any browser indefinitely.
- It has first-class content collection support — the `Stela` schema is enforced at build time.
- It deploys cleanly to Vercel with the same GitHub → Vercel auto-deploy pattern as the-elder.
- It does not lock the project into a framework's churn cycle. If Astro itself becomes unmaintained, the output is already static HTML that survives the framework's death.

The Anthropic API (Phase 4) runs in a server-side route handler for the internal drafting tool. The public site has no runtime API dependency. If the API key expires, dies, or is revoked, every published stela still renders.

### Stack details

- **Framework**: Astro
- **Language**: TypeScript
- **Typography**: Cinzel Decorative + Cormorant Garamond (matching the-elder)
- **Content**: Astro content collections in `/src/content/stelae/` (version-controlled, schema-validated)
- **AI drafting (Phase 4)**: Anthropic API (`claude-sonnet-4-6`), server-side only, internal admin tool
- **Deploy**: Vercel, GitHub → Vercel auto-deploy
- **Repo**: `AHAU-ai/kakaw`

### Routing

```
/                    homepage — frame the project, name the discipline
/stelae              index of all published stelae
/stela/[slug]        single stela: print-fidelity, permalink, share
/cooperatives        index of partner cooperatives with direct links
/coop/[slug]         stable redirect to cooperative URL (see below)
/sources             the scholarly and ceremonial sources informing the work
/lineage             advisory relationships and authorial position
/corrections         public log of every correction made to any stela
/about               who, what, why, how
```

### Folder structure

```
kakaw/
├── src/
│   ├── pages/
│   │   ├── index.astro
│   │   ├── stelae/index.astro
│   │   ├── stela/[slug].astro
│   │   ├── cooperatives/index.astro
│   │   ├── coop/[slug].astro          # stable redirect handler
│   │   ├── sources.astro
│   │   ├── lineage.astro
│   │   ├── corrections.astro
│   │   └── about.astro
│   ├── content/
│   │   ├── config.ts                  # Astro content schema
│   │   ├── stelae/                    # one .md/.json per stela
│   │   ├── cooperatives/              # one .json per cooperative partner
│   │   └── corrections/               # one .json per correction event
│   ├── layouts/
│   │   └── StelaLayout.astro          # print-fidelity stela rendering
│   └── styles/
│       └── global.css
├── admin/                             # Phase 4: internal drafting tool
│   └── (not public; auth-gated)
├── README.md                          # this document
└── package.json
```

### The stela schema

```typescript
// src/content/config.ts

import { defineCollection, z } from 'astro:content';

const stelaSchema = z.object({
  slug: z.string(),
  title: z.object({
    kiche: z.string(),
    es: z.string(),
    en: z.string(),
  }),

  // The data
  fact: z.object({
    summary: z.string(),
    citation: z.object({
      source: z.string(),               // e.g. "Codex Mendoza, folio 47r"
      volume: z.string().optional(),    // e.g. "McNeil 2006, p. 184"
      verified: z.boolean(),
    }),
    geographic_context: z.string().optional(),
    temporal_context: z.string(),
  }),

  // The wound
  colonial_frame: z.string(),

  // The rendering
  rendering: z.object({
    kiche: z.object({
      text: z.string(),
      status: z.enum(['placeholder', 'draft', 'reviewed', 'approved']),
      reviewer: z.string().optional(),
      review_date: z.string().optional(),
    }),
    es: z.object({ text: z.string() }),
    en: z.object({ text: z.string() }),
    syntactic_form: z.string(),
  }),

  // The contemporary anchor
  cooperative: z.object({
    slug: z.string(),                   // references /coop/[slug] stable redirect
    name: z.string(),
    location: z.string(),
    relationship: z.string(),
  }),

  // The lineage
  authorship: z.object({
    drafted_by: z.string(),
    advised_by: z.array(z.string()),
    reviewed_by: z.string().optional(),
    review_date: z.string().optional(),
    lineage_integrity_reviewed_by: z.string().optional(),
    lineage_integrity_review_date: z.string().optional(),
  }),

  // Versioning
  version: z.number(),
  published: z.string(),
  last_updated: z.string(),
  corrections_log: z.array(z.string()),

  // Publication gate
  publication_status: z.enum(['draft', 'pending_review', 'pending_lineage_review', 'live', 'withdrawn']),
});
```

Stelae with `publication_status: 'live'` must also have:
- `rendering.kiche.status: 'approved'`
- `authorship.reviewed_by` populated
- `authorship.lineage_integrity_reviewed_by` populated
- `cooperative.slug` referencing a live cooperative entry

The build script enforces these constraints. A stela that violates them fails to build.

---

## Cooperative redirect architecture

Cooperative websites change. Domains expire. A stela is designed to last; an external URL is not.

Every stela links to its cooperative through a stable kakaw-domain redirect:

- **Stela contains**: `cooperative.slug: "finca-la-rioja"`
- **Stela renders link as**: `https://kakaw.app/coop/finca-la-rioja`
- **`/coop/finca-la-rioja` redirects to**: whatever URL the cooperative currently uses, as recorded in `/src/content/cooperatives/finca-la-rioja.json`

When a cooperative changes its URL, one file is updated in the repo. Every stela that links to that cooperative continues to work. The published artifact never breaks.

Screenshots of a stela carry the stable URL. The redirect is the contract.

---

## The voice that drafts the stelae

The rendering voice is **Ojer Tzij** — the K'iche' lineage voice at the south direction of the AHAU AI Council, restricted to the cacao field. Drawing only from the Popol Wuj, the codex tradition, K'iche' ceremonial vocabulary, and the documented ethnographic record.

A focused system prompt (in `admin/lib/ojer-tzij-voice.ts`, Phase 4 deliverable) will constrain the API output to:

- The syntactic discipline of K'iche' prayer: parallel couplet, sacred doubling, *sachnaaq poqnaaq* devastation rhythm where the data warrants it
- Vocabulary restricted to terms operative within K'iche' cosmology
- Refusal to produce English-language wellness register, generic mythopoetic voice, or cross-traditional metaphor
- Explicit naming of the colonial frame when the source document is a colonial document

**The API drafts the Spanish and English. The K'iche' is authored by a certified K'iche' speaker — never by the API.** This is non-negotiable. The drafting tool produces Spanish and English drafts and a structural notation. A K'iche' poet, in consultation with the project's advisors, authors the K'iche' rendering. The Spanish and English then return to the K'iche' poet for ratification — does the colonial-language rendering honor what the K'iche' rendering establishes? If not, the colonial-language renderings are revised until they do.

This inverts the standard translation flow. The K'iche' is not translated from the English; the English is responsible to the K'iche'.

---

## The first stela

**Slug**: `xoconochco-tribute`
**Publication status**: `draft` — awaiting K'iche' authorship, cooperative partner confirmation, and full review pass

### The fact

The Aztec tribute province of Xoconochco (modern Soconusco, Pacific coast of Chiapas) delivered approximately 980 *cargas* of cacao annually to Tenochtitlan in the late pre-conquest period. At ~24,000 beans per carga, this represents approximately 23,520,000 beans per year, carried over mountain passes by *tlamemes* (human porters) and *pochteca* (merchant-priests).

**Sources**: Codex Mendoza, folio 47r; McNeil, *Chocolate in Mesoamerica* (2006); Coe & Coe, *A True History of Chocolate* (2013).

### The colonial frame

This number exists because tribute extraction required it to exist. The Codex Mendoza was compiled for a Spanish viceroy. The record we read is the record the imperial apparatus kept of what could be taken. The bean count is the inventory of a conquest.

### The renderings

**K'iche'** — *to be authored by a certified K'iche' poet in consultation with the project's K'iche' advisor. No placeholder text appears here.*

**Spanish** — *to be drafted in the Ojer Tzij discipline after K'iche' authorship establishes the structural and symbolic field. No placeholder text appears here.*

**English** — *to be drafted in the Ojer Tzij discipline after K'iche' authorship establishes the structural and symbolic field. No placeholder text appears here.*

**Syntactic form**: to be determined by the K'iche' author. The strong candidate is parallel couplet with closing inversion — the final couplet refusing the sacred frame the opening couplets establish, naming the extraction.

### The contemporary anchor

*Pending — to be confirmed through the cooperative outreach stream.*

Soconusco today produces ceremonial-grade cacao through Maya-led cooperatives operating on the same Pacific coast that supplied Tenochtitlan five centuries ago. The stela's redirect will link to a cooperative confirmed through direct relationship-building, with explicit permission to be named.

### The authorship

- **Project lead**: Yes-I Morales (Temporal Bridges Institute)
- **Scholarly co-author**: Dr. Vincent James Stanzione (Temporal Bridges Institute; K'iche' ethnography)
- **K'iche' authorship**: *pending — to be confirmed*
- **Cooperative liaison**: *pending — to be confirmed*
- **Accountability holder**: Dr. Vincent James Stanzione (see "Governance" below)
- **Sources**: Codex Mendoza f. 47r; McNeil 2006; Coe & Coe 2013

---

## Build phases

### Phase 0 — Pre-build (relational work, before code)

The pre-build work runs in two parallel streams. Phase 1 does not begin until both streams reach their named first milestones.

**Stream A: K'iche' authorship relationship**

- [ ] Confirm name (*kakaw* — or another root form) with Yes-I's guide in San Pedro La Laguna
- [ ] Identify and approach a certified K'iche' poet or Ajq'ij willing to author the K'iche' rendering of the first stela
- [ ] Establish terms of collaboration: attribution, compensation, review authority, takedown authority
- [ ] Receive first K'iche' rendering for the Xoconochco stela
- **First milestone**: approved K'iche' rendering for the first stela, with named author and terms of ongoing relationship

**Stream B: Cooperative outreach relationship**

- [ ] Identify candidate cooperative partners in Soconusco / Chiapas region
- [ ] Approach through existing Temporal Bridges Institute networks where possible
- [ ] Establish terms of partnership: how the cooperative is named, how the link is routed, what relationship to the project the cooperative wants
- [ ] Receive explicit written permission to be named and linked
- **First milestone**: confirmed cooperative partner for the first stela, with stable URL and named contact

### Phase 1 — Scaffolding

- [ ] Create GitHub repo `AHAU-ai/kakaw`
- [ ] Initialize Astro (TypeScript, content collections)
- [ ] Commit this README
- [ ] Connect Vercel, configure auto-deploy
- [ ] Add `ANTHROPIC_API_KEY` to Vercel env vars (Phase 4 use)
- [ ] Build the content collection schema in `src/content/config.ts`

### Phase 2 — The first stela live

- [ ] Commit `src/content/stelae/xoconochco-tribute.md` (K'iche'-authored, fully reviewed)
- [ ] Commit `src/content/cooperatives/[slug].json` for the partner cooperative
- [ ] Build `src/pages/stela/[slug].astro` — single stela at print fidelity
- [ ] Build `src/pages/coop/[slug].astro` — stable redirect handler
- [ ] Build `src/pages/index.astro` — homepage framing the project
- [ ] Run the Lineage Integrity Review checklist (see below)
- [ ] Deploy. Site is live with one stela. **Minimum viable artifact.**

### Phase 3 — The full archive frame

- [ ] `/stelae` index
- [ ] `/cooperatives` page
- [ ] `/sources` page
- [ ] `/lineage` page
- [ ] `/corrections` page (empty at launch; structure in place)
- [ ] `/about` page

### Phase 4 — The drafting engine

- [ ] Author `admin/lib/ojer-tzij-voice.ts` system prompt (in consultation with Dr. Stanzione and the K'iche' authorship partner)
- [ ] Build `admin/draft` — server-side route handler, streaming SSE, auth-gated
- [ ] Drafting tool produces *Spanish and English drafts only*; K'iche' remains human-authored
- [ ] Establish formal review-before-publish workflow

### Phase 5 — Second and third stelae

- [ ] Burial-offering stela: Río Azul vessel finds, *pataxte* in funerary context
- [ ] Popol Wuj stela: the cacao tree at the crossroads (the mythic source itself)
- [ ] Three live stelae establish the pattern publicly

---

## The Lineage Integrity Review

Every stela passes through an explicit Lineage Integrity Review before `publication_status` may be set to `live`. The reviewer is the K'iche' authorship partner or another named advisor with standing in the tradition. The review uses this checklist:

**Vocabulary check**

- [ ] Does every metaphor in the renderings draw from the Popol Wuj, codex tradition, or documented K'iche' ceremonial vocabulary?
- [ ] Are there any terms or images that require a source outside Maya tradition to be intelligible? (If yes — strike.)
- [ ] Does the Spanish rendering avoid generic Latin American magical-realist register?
- [ ] Does the English rendering avoid generic mystic, wellness, or new-age register?

**Structural check**

- [ ] Does the syntactic form derive from K'iche' prayer structure?
- [ ] Is the colonial frame present and clearly named?
- [ ] Does the contemporary anchor appear in the composition's body, not as a footer?

**Authorial position check**

- [ ] Is the authorship clearly named?
- [ ] Does the artifact avoid claiming K'iche' voice for non-K'iche' authors?

**Source check**

- [ ] Is the historical citation verifiable to a published source?
- [ ] Does the stela accurately represent what the source documents?

If any item fails, the stela returns to revision. The reviewer's name and review date are recorded in the stela's `authorship.lineage_integrity_reviewed_by` field.

---

## Governance

**Accountability holder**: Dr. Vincent James Stanzione holds the role of project accountability holder. Correction requests, takedown requests, and concerns about lineage integrity are routed to him for adjudication. This role is named publicly on `/lineage` and `/about`. If Dr. Stanzione is unavailable, the role temporarily transfers to Yes-I Morales, with re-adjudication when Dr. Stanzione returns.

**Corrections protocol**: any error of fact, mistranslation, misuse of sacred term, or breach of lineage discipline triggers immediate revision. The original is preserved in version history. A correction entry is added to `/src/content/corrections/` and surfaces on `/corrections`. The accountability holder confirms the correction has been received and processed.

**Takedown protocol**: any Ajq'ij or named K'iche' authority can request takedown of any stela. Takedowns happen within 24 hours of request and are logged publicly with the requester's stated reason (or anonymized if requested). The takedown protocol is faster than the publication protocol — deliberately so.

**Advisory relationships**: this work proceeds under the mentorship of Yes-I's guide in San Pedro La Laguna, Guatemala, and Dr. Vincent James Stanzione (Temporal Bridges Institute), and the K'iche' authorship partner named once Stream A completes. No K'iche' rendering is published until authored or approved by a certified K'iche' speaker.

**Authorial position, named honestly**: this work is produced by students of K'iche' tradition working in service of the lineage. It does not claim the position of K'iche' authorship. The position it claims is K'iche'-mentored, lineage-attentive, governance-accountable scholarship in poetic register. This position appears on every artifact.

---

## Sources

**Primary scholarship**

- McNeil, Cameron L., ed. *Chocolate in Mesoamerica: A Cultural History of Cacao.* University Press of Florida, 2006.
- Coe, Sophie D. and Michael D. Coe. *The True History of Chocolate.* Thames & Hudson, 3rd ed. 2013.

**Primary sources**

- Codex Mendoza (especially folios documenting Xoconochco tribute)
- Dresden Codex (cacao iconography, divine offering imagery)
- The Popol Wuj (Sam Colop K'iche' edition; Tedlock translation)
- Archaeological vessel finds: Copán, Río Azul, and related sites

**Companion projects**

- the-elder ([the-elder.vercel.app](https://the-elder.vercel.app)) — AHAU AI Council of Voices, divinatory register
- *Ix K'ik' Awakens* — feature screenplay, Popol Wuj cinematic adaptation
- Temporal Bridges Institute — the broader scholarly and ceremonial frame

---

## License and distribution

To be determined in consultation with K'iche' advisors and Temporal Bridges Institute. The default position:

- The site is freely viewable
- Stelae can be shared and screenshotted with attribution intact
- Commercial use requires explicit permission
- The drafting tool (Phase 4+) is not publicly licensed; it remains an internal tool under governance review

---

*Maltyox. Maltyox. Maltyox.*

*Are u xe' ojer tzij.*

---

**Repo**: `AHAU-ai/kakaw`
**Deploy target**: Vercel
**Stack**: Astro
**Companion**: [the-elder.vercel.app](https://the-elder.vercel.app)
**Institute**: Temporal Bridges
**Accountability holder**: Dr. Vincent James Stanzione
