// Costanti e funzioni di supporto condivise in tutta l'app

const ABILITIES = ["FOR", "DES", "COS", "INT", "SAG", "CAR"];
const ABILITY_LABELS = { FOR: "Forza", DES: "Destrezza", COS: "Costituzione", INT: "Intelligenza", SAG: "Saggezza", CAR: "Carisma" };
const PROGRESSIONE_LABELS = { nessuno: "Non incantatore", mezzo: "Mezzo incantatore", pieno: "Incantatore completo" };

const MAGICO_OPTIONS = [{ id: "non_magico", nome: "Non Magico" }, { id: "magico", nome: "Magico" }];
const POSIZIONE_OPTIONS = [{ id: "indosso", nome: "Indosso" }, { id: "zaino", nome: "Zaino" }, { id: "tasca_cintura", nome: "Tasca da Cintura" }];
const RARITA_OPTIONS = [{ id: "comune", nome: "Comune" }, { id: "non_comune", nome: "Non Comune" }, { id: "raro", nome: "Raro" }, { id: "molto_raro", nome: "Molto Raro" }, { id: "leggendario", nome: "Leggendario" }, { id: "artefatto", nome: "Artefatto" }];
const uid = () => (crypto.randomUUID ? crypto.randomUUID() : `id_${Math.random().toString(36).slice(2)}_${Date.now()}`);
const mod = (score) => Math.floor((Number(score || 10) - 10) / 2);
const fmt = (n) => (n >= 0 ? `+${n}` : `${n}`);
const zeroBonus = () => ({ FOR: 0, DES: 0, COS: 0, INT: 0, SAG: 0, CAR: 0 });

function nomeFonte(fonte) {
  const m = (fonte || "").match(/\(([^)]+)\)/);
  return m ? m[1] : fonte;
}

function parseTratti(testo) {
  if (!testo) return [];
  return testo.split("\n").map((l) => l.trim()).filter(Boolean).map((l) => {
    const idx = l.indexOf(":");
    return idx === -1 ? { nome: l, desc: "" } : { nome: l.slice(0, idx).trim(), desc: l.slice(idx + 1).trim() };
  });
}


const PROF_BONUS_BY_LEVEL = (lvl) => (lvl >= 17 ? 6 : lvl >= 13 ? 5 : lvl >= 9 ? 4 : lvl >= 5 ? 3 : 2);

const APPLICA_A_OPTIONS = (skills) => [
  { value: "nessuno", label: "Nessun effetto meccanico" },
  { value: "CA", label: "Classe Armatura" },
  { value: "Iniziativa", label: "Iniziativa" },
  ...ABILITIES.map((a) => ({ value: `TS_${a}`, label: `Tiro Salvezza ${ABILITY_LABELS[a]}` })),
  ...skills.map((s) => ({ value: `SKILL_${s.name}`, label: s.name })),
];



export { ABILITIES, ABILITY_LABELS, PROGRESSIONE_LABELS, MAGICO_OPTIONS, RARITA_OPTIONS, POSIZIONE_OPTIONS, uid, mod, fmt, zeroBonus, nomeFonte, parseTratti, PROF_BONUS_BY_LEVEL, APPLICA_A_OPTIONS };
