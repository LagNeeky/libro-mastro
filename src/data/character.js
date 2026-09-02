import { uid } from '../utils/helpers.js';

// Struttura dati di un personaggio vuoto

const newCharacter = (nome = "") => ({
  id: uid(), nome,
  nomeGiocatore: "", dataCreazione: "",
  razzaNome: "", razzaId: null, sottorazzaNome: "", sottorazzaId: null,
  backgroundNome: "", backgroundId: null,
  classi: [{ instId: uid(), nome: "", classeId: null, sottoclasseNome: "", sottoclasseId: null, livello: 1 }],
  abilita: { FOR: 10, DES: 10, COS: 10, INT: 10, SAG: 10, CAR: 10 },
  pfMax: 10, pfAttuali: 10, pfTemp: 0, pfDanniTotale: 0,
  dadiVitaUsati: {},
  caOverride: null, iniziativaBonus: 0, scudo: false, velocitaOverride: null,
  tiriCompetenti: [], abilitaCompetenti: [], abilitaEsperte: [],
  tiriSalvezzaOverride: {}, abilitaOverride: {},
  competenzeGeneriche: [],
  trattiRazziali: [], privilegiClasse: [], infoExtra: [],
  incantesimiNoti: [],
  incantesimiLivelloLancio: {},
  armiPossedute: [], armaturePossedute: [], armaturaIndossataInstId: null, accessoriPosseduti: [],
  inventario: [],
  valute: [{ id: uid(), categoria: "Oro", speso: 0, ricavato: 0, inPossesso: 0 }, { id: uid(), categoria: "Argento", speso: 0, ricavato: 0, inPossesso: 0 }, { id: uid(), categoria: "Bronzo", speso: 0, ricavato: 0, inPossesso: 0 }],
  note: "",
  identita: { immagineUrl: "", eta: "", altezza: "", peso: "", occhi: "", capelli: "", carnagione: "", segniParticolari: "", aspettoFisico: "", tratti: "", ideali: "", legami: "", difetti: "", storia: "" },
  compArmature: { leggera: false, media: false, pesante: false }, compArmi: { improvvisata: false, semplice: false, daGuerra: false }, compScudi: false,
  talenti: [],
  // ogni talento può avere: id, catalogoId (se preso dal catalogo Talenti), nome, desc, applicaA, valore
  slotIncantesimo: Array.from({ length: 9 }, (_, i) => ({ livello: i + 1, totali: 0, usati: 0 })),
  puntiStregoneria: { totali: 0, usati: 0 },
  puntiKi: { totali: 0, usati: 0 },
  imposizioneMani: { rimanenti: 0, totali: 0 },
  mostraSlotIncantesimi: false,
  mostraIncantesimiNoti: false,
  mostraPuntiKi: false,
});

// Completa un personaggio salvato in precedenza con gli eventuali campi introdotti da
// aggiornamenti successivi dell'app (es. Punti Ki, override personalizzati, ecc.), senza
// mai toccare i valori gia' presenti. Da usare al caricamento per evitare che schede salvate
// prima di un aggiornamento causino errori per campi mancanti.
function migrateCharacter(pg) {
  if (!pg || typeof pg !== "object") return pg;
  const base = newCharacter();
  const merged = { ...base, ...pg };
  // unione (non sovrascrittura) degli oggetti annidati, cosi' un campo interno mancante non fa sparire l'intero blocco
  merged.identita = { ...base.identita, ...(pg.identita || {}) };
  merged.compArmature = { ...base.compArmature, ...(pg.compArmature || {}) };
  merged.compArmi = { ...base.compArmi, ...(pg.compArmi || {}) };
  merged.puntiStregoneria = { ...base.puntiStregoneria, ...(pg.puntiStregoneria || {}) };
  merged.puntiKi = { ...base.puntiKi, ...(pg.puntiKi || {}) };
  merged.imposizioneMani = { ...base.imposizioneMani, ...(pg.imposizioneMani || {}) };
  merged.abilita = { ...base.abilita, ...(pg.abilita || {}) };
  merged.tiriSalvezzaOverride = { ...(pg.tiriSalvezzaOverride || {}) };
  merged.abilitaOverride = { ...(pg.abilitaOverride || {}) };
  merged.incantesimiLivelloLancio = { ...(pg.incantesimiLivelloLancio || {}) };
  merged.dadiVitaUsati = { ...(pg.dadiVitaUsati || {}) };
  merged.slotIncantesimo = Array.isArray(pg.slotIncantesimo) && pg.slotIncantesimo.length ? pg.slotIncantesimo : base.slotIncantesimo;
  return merged;
}
function migratePersonaggi(stored) {
  if (!Array.isArray(stored) || !stored.length) return [newCharacter()];
  return stored.map(migrateCharacter);
}

export { newCharacter, migrateCharacter, migratePersonaggi };
