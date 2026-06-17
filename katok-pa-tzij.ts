/**
 * ════════════════════════════════════════════════════════════════════════
 *  KATOK PA TZIJ — Enter the Word
 *  A transformational state machine for Applied Mythopoetics
 *
 *  The Popol Wuj descent, modeled as code. Not a metaphor laid over a
 *  program — the program IS the domain model: psychic energy meets an
 *  archetypal form, the Word opens as a threshold, the pilgrim descends
 *  through the Houses of Xibalba, and the soul is either ground into maize
 *  (productive creativity) or swept away as flood (inflation / possession).
 *
 *  The crux is the Nawal Transformation: IxKik' does not surrender her
 *  authentic heart to the Lords. She crafts an image from the resin of the
 *  Red Tree, and because image and energy are ONE WEAVING, the Lords — who
 *  can only devour, never make — cannot tell the difference.
 *
 *  Lineage accountability: K'iche' Maya field only. Uk'u'x Kaj-Ulew.
 * ════════════════════════════════════════════════════════════════════════
 */

// ── I. ENERGETICS (Jung's libido — undifferentiated until constellated) ──

type Polarity = "UNDIFFERENTIATED" | "PRODUCTIVE" | "DESTRUCTIVE";

interface SoulEnergy {
  charge: number;            // raw psychic intensity (libido)
  polarity: Polarity;        // the riverbed has not yet directed it
  numinous: boolean;         // does it carry the felt charge of the sacred?
}

/**
 * An Archetype is a RIVERBED, not a reservoir. It holds no energy.
 * It is pure form, pure waiting — carved before the mountains.
 * It only acquires numinosity when energy rushes into it: constellation.
 */
class Archetype {
  constructor(
    public readonly name: string,
    public readonly field: "K'iche'", // Lineage Integrity of Voice
  ) {}

  /** The awakening: formless energy meets ancient form and begins to RUN. */
  constellate(energy: SoulEnergy): SoulEnergy {
    return { ...energy, numinous: true, polarity: "UNDIFFERENTIATED" };
  }
}

// ── II. THE WORD (Tzij) — a door that swings open from both sides ──

/**
 * To "enter the word" (katok pa tzij) is not to read it. It is to cross a
 * threshold into the Mundus Imaginalis — Corbin's middle world — where in
 * illo tempore is perpetually present and reachable through ceremonial
 * re-entry. The guardian is curiosity, not armor.
 */
class TheWord {
  constructor(private readonly tradition: string) {}

  katok(pilgrim: Pilgrim): boolean {
    // The door opens only for the one who walks toward the forbidden
    // question. Obedience to the Lords cannot cross this threshold.
    if (!pilgrim.curiosity) {
      pilgrim.log(`The door does not open. ${pilgrim.name} turned back at the prohibition.`);
      return false;
    }
    pilgrim.log(`⟡ ${pilgrim.name} enters the word of ${this.tradition}. In illo tempore.`);
    pilgrim.insideTheWord = true;
    return true;
  }
}

// ── III. THE FIVE SIGNALS + READINESS GATE (The Elder pattern) ──

type Signal = "WOUND" | "FIGURE" | "THRESHOLD" | "EXILE" | "PATTERN";
const ALL_SIGNALS: Signal[] = ["WOUND", "FIGURE", "THRESHOLD", "EXILE", "PATTERN"];

class ReadinessGate {
  private seen = new Set<Signal>();

  mark(signal: Signal): void {
    this.seen.add(signal);
  }

  /** Fail-closed: a Reading is only emitted when all five are present. */
  ready(): boolean {
    return ALL_SIGNALS.every((s) => this.seen.has(s));
  }

  token(): string {
    return this.ready() ? "⟡⟡READY⟡⟡" : `⟡ ${this.seen.size}/5`;
  }
}

// ── IV. THE HOUSES OF XIBALBA (the states of the descent) ──

interface House {
  name: string;
  nature: string;       // name the house accurately, or you cannot survive it
  signal: Signal;       // each house tests/reveals one diagnostic marker
  cunningNeeded: number;
}

const XIBALBA: House[] = [
  { name: "Dark House",   nature: "the dark you have agreed not to see",        signal: "EXILE",     cunningNeeded: 2 },
  { name: "Cold House",   nature: "the freezing of feeling, numbness",          signal: "WOUND",     cunningNeeded: 1 },
  { name: "Jaguar House", nature: "the appetites that would consume you",       signal: "FIGURE",    cunningNeeded: 3 },
  { name: "Bat House",    nature: "the severing blade, loss of the old head",   signal: "THRESHOLD", cunningNeeded: 4 },
  { name: "Razor House",  nature: "the blades that move only if you struggle",  signal: "PATTERN",   cunningNeeded: 2 },
];

// ── V. THE LORDS OF DEATH (they devour; they cannot make) ──

class LordsOfXibalba {
  /**
   * The Lords inspect an offering. The teaching: they CANNOT distinguish a
   * living heart from a crafted image made with intention and soul-substance.
   * They are satisfied by anything that carries the charge — because devouring
   * is their only faculty. Making is foreclosed to them.
   */
  inspect(offering: Offering): boolean {
    return offering.madeWithIntention && offering.carriesSoulSubstance;
  }
}

// ── VI. THE NAWAL TRANSFORMATION (IxKik' and the Red Tree) ──

interface Offering {
  form: string;
  madeWithIntention: boolean;
  carriesSoulSubstance: boolean;
  isPrivateHeart: boolean; // false when it is the crafted resin-image
}

/**
 * The resin substitution. IxKik' is told to surrender her authentic heart.
 * She does not. She goes to the cancen (Red Tree), gathers its weeping
 * resin, and CRAFTS a heart. Because image and energy are one weaving, the
 * crafted image carries the soul-substance of the real — and protects the
 * private heart that made it.
 *
 * This is nawal transformation: the artist's move. Sticky red sap becomes
 * her very own heart and blood, and the Lords breathe the sweet smoke of
 * the sacred tree, satisfied.
 */
function nawalTransform(craftCunning: number): Offering {
  if (craftCunning <= 0) {
    // No craft: she would have to surrender the private heart itself.
    return { form: "raw heart", madeWithIntention: false, carriesSoulSubstance: true, isPrivateHeart: true };
  }
  return {
    form: "heart of cinnabar-resin from the Red Tree",
    madeWithIntention: true,
    carriesSoulSubstance: true, // the image IS the energy
    isPrivateHeart: false,      // the true heart walks out of Xibalba intact
  };
}

// ── VII. THE MYTHIC FIGURES (Lineage Integrity — each from its own field) ──

const FIGURES = {
  IxKik: {
    venus: "—",
    teaches: () =>
      "Choose the forbidden question over the prohibition. Reach toward the skull in the tree.",
    asks: () =>
      "Whose bowl are you feeding your authentic heart into, every day, without crafting an image first?",
  },
  IxMuqane: {
    venus: "—",
    teaches: () =>
      "Tend what was left growing in the house while the others descended. Read the seed.",
    asks: () =>
      "What did you leave alive in the house before you went down — and is anyone tending it?",
  },
  Junajpu: {
    venus: "Morning Star — Pioneer (rises as the Sun)",
    teaches: () => "Know the nature of the house you are in before you devise your cunning.",
    asks: () => "Do you know what house you are in? Name its true nature, not its pleasant name.",
  },
  Ixbalamkej: {
    venus: "Evening Star — Warrior (the dark radiance of the Jaguar Star)",
    teaches: () => "The darkness is information. Move by night-vision, not by daylight alone.",
    asks: () => "What have you trained yourself to look away from? The transformation lives there.",
  },
} as const;

// ── VIII. THE PILGRIM (the descending soul) ──

class Pilgrim {
  insideTheWord = false;
  descended = false;
  transformed = false;
  energy: SoulEnergy = { charge: 100, polarity: "UNDIFFERENTIATED", numinous: false };
  private journal: string[] = [];

  constructor(
    public readonly name: string,
    public readonly curiosity: boolean,        // reaches toward the question?
    public readonly willingToDie: boolean,     // accepts symbolic death in the Fire House?
    public readonly craftCunning: number,      // the artist's resin-craft (IxKik')
  ) {}

  log(line: string): void { this.journal.push(line); }
  transcript(): string { return this.journal.join("\n"); }
}

// ── IX. THE YELLOW TREE (the failure mode — the Older Brothers) ──

/**
 * Jun B'atz' and Jun Chowen refuse the descent and climb the Yellow Tree of
 * pride and anger. The tree grows beneath them; they are transformed — not
 * into heroes but into howler monkeys: creatively fecund, but no longer on
 * the road, no longer subject to the test. Inflation without transformation.
 */
function climbYellowTree(pilgrim: Pilgrim): TransformationResult {
  pilgrim.log(`${pilgrim.name} climbs into the Yellow Tree of Anger. It grows. It grows.`);
  pilgrim.log("Transformed into a howler monkey: still able to make music and art —");
  pilgrim.log("but no longer walking the road, no longer transformed at the root.");
  return {
    outcome: "YELLOW_TREE",
    polarity: "DESTRUCTIVE",
    creativity: "fecund-but-treebound",
    heartPreserved: false,
    transformed: false,
  };
}

// ── X. THE PULSE — Uk'u'x Kaj-Ulew (the non-dual ground / runtime) ──

interface TransformationResult {
  outcome: "RISEN" | "FLOOD" | "YELLOW_TREE" | "TURNED_BACK";
  polarity: Polarity;
  creativity: string;
  heartPreserved: boolean;
  transformed: boolean;
}

/**
 * Uk'u'x Kaj-Ulew does not ask. It beats. Its three-phase pulse drives every
 * descent: Grow → Go Down → Come Back Transformed. There is no pilgrim
 * standing BESIDE the river — energy, riverbed, word, and soul are one weave.
 */
function enterTheWord(pilgrim: Pilgrim): TransformationResult {
  const word = new TheWord("the Nawal Ajaw of the Popol Wuj");
  const gate = new ReadinessGate();
  const lords = new LordsOfXibalba();
  const rootArchetype = new Archetype("Uk'u'x Kaj-Ulew / Heart of Sky-Earth", "K'iche'");

  // PULSE 1 — GROW. Energy constellates against the archetypal riverbed.
  pilgrim.energy = rootArchetype.constellate(pilgrim.energy);
  pilgrim.log(`〜 The cloud breaks. Energy floods the ancient bed. Numinous: ${pilgrim.energy.numinous}.`);

  // Cross the threshold of the Word.
  if (!word.katok(pilgrim)) {
    return { outcome: "TURNED_BACK", polarity: "DESTRUCTIVE", creativity: "none", heartPreserved: true, transformed: false };
  }

  // The pride-path: refuse the descent → the Yellow Tree.
  if (!pilgrim.willingToDie) {
    return climbYellowTree(pilgrim);
  }

  // PULSE 2 — GO DOWN. Walk the Houses of Xibalba (the state machine).
  pilgrim.descended = true;
  for (const house of XIBALBA) {
    const survived = pilgrim.craftCunning >= house.cunningNeeded || house.cunningNeeded <= 2;
    pilgrim.log(`↓ ${house.name} — ${house.nature}`);
    if (survived) {
      gate.mark(house.signal);
      pilgrim.log(`   survived by cunning. signal lit: ${house.signal}  [${gate.token()}]`);
    } else {
      pilgrim.log(`   the house was not named truly. The river breaks its banks.`);
      return { outcome: "FLOOD", polarity: "DESTRUCTIVE", creativity: "flood-the-village", heartPreserved: false, transformed: false };
    }
  }

  // The Lords demand the authentic heart. IxKik's nawal move.
  const offering = nawalTransform(pilgrim.craftCunning);
  const satisfied = lords.inspect(offering);
  pilgrim.log(`\nThe Lords demand the heart. ${pilgrim.name} offers: ${offering.form}.`);
  pilgrim.log(`The Lords inspect... satisfied: ${satisfied}. Private heart preserved: ${!offering.isPrivateHeart}.`);

  // PULSE 3 — COME BACK TRANSFORMED. The readiness gate decides.
  if (gate.ready() && satisfied && !offering.isPrivateHeart) {
    pilgrim.transformed = true;
    pilgrim.energy.polarity = "PRODUCTIVE";
    pilgrim.log(`\n${gate.token()} — ${pilgrim.name} rises from the Fire House as Sun and Jaguar-Star.`);
    pilgrim.log("The river is banked. It turns the millwheel. It grinds maize.");
    return { outcome: "RISEN", polarity: "PRODUCTIVE", creativity: "grind-the-maize", heartPreserved: true, transformed: true };
  }

  pilgrim.log("\nThe signals did not all light, or the heart was surrendered raw. The flood takes the village.");
  return { outcome: "FLOOD", polarity: "DESTRUCTIVE", creativity: "flood-the-village", heartPreserved: offering.isPrivateHeart ? false : true, transformed: false };
}

// ════════════════════════════ DEMO ════════════════════════════
// Three pilgrims enter the word. The myth runs.

function divine(p: Pilgrim): void {
  const r = enterTheWord(p);
  console.log(`\n━━━ ${p.name} ━━━`);
  console.log(p.transcript());
  console.log(`\n  RESULT → ${r.outcome} | ${r.polarity} | creativity: ${r.creativity} | transformed: ${r.transformed}`);
  console.log("─".repeat(64));
}

// IxKik' — curious, willing, master of the resin-craft. She rises.
divine(new Pilgrim("IxK'ik'", true, true, 5));

// The Older Brother — gifted but proud. He will not descend. The Yellow Tree.
divine(new Pilgrim("Jun B'atz'", true, false, 5));

// The one who reaches but brings no craft — surrenders the raw heart. Flood.
divine(new Pilgrim("The Uncrafted One", true, true, 0));

console.log("\nUk'u'x Kaj-Ulew does not ask. It beats:  Grow.  Go down.  Come back.  Transformed.");
console.log("Maltyox. Saq be'.");
