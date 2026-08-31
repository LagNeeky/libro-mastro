// Tabelle ufficiali di progressione slot incantesimo, magia del patto e punti stregoneria

const TABELLA_SLOT_PIENI = [
  [0, 0, 0, 0, 0, 0, 0, 0, 0], // livello 0 (nessuno slot)
  [2, 0, 0, 0, 0, 0, 0, 0, 0], [3, 0, 0, 0, 0, 0, 0, 0, 0], [4, 2, 0, 0, 0, 0, 0, 0, 0], [4, 3, 0, 0, 0, 0, 0, 0, 0],
  [4, 3, 2, 0, 0, 0, 0, 0, 0], [4, 3, 3, 0, 0, 0, 0, 0, 0], [4, 3, 3, 1, 0, 0, 0, 0, 0], [4, 3, 3, 2, 0, 0, 0, 0, 0],
  [4, 3, 3, 3, 1, 0, 0, 0, 0], [4, 3, 3, 3, 2, 0, 0, 0, 0], [4, 3, 3, 3, 2, 1, 0, 0, 0], [4, 3, 3, 3, 2, 1, 0, 0, 0],
  [4, 3, 3, 3, 2, 1, 1, 0, 0], [4, 3, 3, 3, 2, 1, 1, 0, 0], [4, 3, 3, 3, 2, 1, 1, 1, 0], [4, 3, 3, 3, 2, 1, 1, 1, 0],
  [4, 3, 3, 3, 2, 1, 1, 1, 1], [4, 3, 3, 3, 3, 1, 1, 1, 1], [4, 3, 3, 3, 3, 2, 1, 1, 1], [4, 3, 3, 3, 3, 2, 2, 1, 1],
];
// Magia del Patto del Warlock: slot separati dal pool condiviso (si recuperano con riposo breve).
const TABELLA_PATTO_WARLOCK = [
  { slots: 0, livello: 0 },
  { slots: 1, livello: 1 }, { slots: 2, livello: 1 }, { slots: 2, livello: 2 }, { slots: 2, livello: 2 },
  { slots: 2, livello: 3 }, { slots: 2, livello: 3 }, { slots: 2, livello: 4 }, { slots: 2, livello: 4 },
  { slots: 2, livello: 5 }, { slots: 2, livello: 5 }, { slots: 3, livello: 5 }, { slots: 3, livello: 5 },
  { slots: 3, livello: 5 }, { slots: 3, livello: 5 }, { slots: 3, livello: 5 }, { slots: 3, livello: 5 },
  { slots: 4, livello: 5 }, { slots: 4, livello: 5 }, { slots: 4, livello: 5 }, { slots: 4, livello: 5 },
];
// Punti Stregoneria dello Stregone: pari al livello classe dal 2° in su.
const puntiStregoneriaPerLivello = (lvl) => (lvl >= 2 ? lvl : 0);

// Sottoclassi che concedono lancio di incantesimi "a un terzo" (Cavaliere Magico, Trickster Arcano).
const TERZO_CASTER_SOTTOCLASSI = ["cavaliere_magico", "trickster_arcano"];

export { TABELLA_SLOT_PIENI, TABELLA_PATTO_WARLOCK, puntiStregoneriaPerLivello, TERZO_CASTER_SOTTOCLASSI };
