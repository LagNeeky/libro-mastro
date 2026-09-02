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

// Incantesimi CONOSCIUTI (progressione fissa) per le classi che non "preparano" ma "conoscono" un numero fisso di incantesimi.
const BARDO_CONOSCIUTI = [0, 4, 5, 6, 7, 8, 9, 10, 11, 12, 14, 15, 15, 16, 18, 19, 19, 20, 22, 22, 22];
const RANGER_CONOSCIUTI = [0, 0, 2, 3, 3, 4, 4, 5, 6, 6, 7, 7, 8, 8, 9, 10, 10, 11, 11, 11, 11];
const STREGONE_CONOSCIUTI = [0, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 12, 13, 13, 14, 14, 15, 15, 15, 15];
const WARLOCK_CONOSCIUTI = [0, 2, 3, 4, 5, 6, 7, 8, 9, 10, 10, 11, 11, 12, 12, 13, 13, 14, 14, 15, 15];
const TERZO_CASTER_CONOSCIUTI = [0, 0, 0, 3, 4, 4, 4, 5, 6, 6, 7, 8, 8, 9, 10, 10, 10, 11, 11, 12, 13];

export { TABELLA_SLOT_PIENI, TABELLA_PATTO_WARLOCK, puntiStregoneriaPerLivello, TERZO_CASTER_SOTTOCLASSI, BARDO_CONOSCIUTI, RANGER_CONOSCIUTI, STREGONE_CONOSCIUTI, WARLOCK_CONOSCIUTI, TERZO_CASTER_CONOSCIUTI };
