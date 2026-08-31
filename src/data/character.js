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
  caOverride: null, iniziativaBonus: 0, scudo: false, velocitaOverride: null,
  tiriCompetenti: [], abilitaCompetenti: [], abilitaEsperte: [],
  trattiRazziali: [], privilegiClasse: [], infoExtra: [],
  incantesimiNoti: [],
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
  mostraSlotIncantesimi: false,
  mostraIncantesimiNoti: false,
  mostraPuntiKi: false,
});


export { newCharacter };
