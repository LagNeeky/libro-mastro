// Modello dati per le Schede Mostri/PNG semplificate (per il Master)

// Grado di Sfida -> Bonus di Competenza (regola ufficiale)
const GS_BONUS_COMPETENZA = {
  "0": 2, "1/8": 2, "1/4": 2, "1/2": 2,
  "1": 2, "2": 2, "3": 2, "4": 2,
  "5": 3, "6": 3, "7": 3, "8": 3,
  "9": 4, "10": 4, "11": 4, "12": 4,
  "13": 5, "14": 5, "15": 5, "16": 5,
  "17": 6, "18": 6, "19": 6, "20": 6,
  "21": 7, "22": 7, "23": 7, "24": 7,
  "25": 8, "26": 8, "27": 8, "28": 8,
  "29": 9, "30": 9,
};

// Grado di Sfida -> Punti Esperienza (per il calcolo degli incontri)
const GS_PUNTI_ESPERIENZA = {
  "0": 10, "1/8": 25, "1/4": 50, "1/2": 100,
  "1": 200, "2": 450, "3": 700, "4": 1100,
  "5": 1800, "6": 2300, "7": 2900, "8": 3900,
  "9": 5000, "10": 5900, "11": 7200, "12": 8400,
  "13": 10000, "14": 11500, "15": 13000, "16": 15000,
  "17": 18000, "18": 20000, "19": 22000, "20": 25000,
  "21": 33000, "22": 41000, "23": 50000, "24": 62000,
  "25": 75000, "26": 90000, "27": 105000, "28": 120000,
  "29": 135000, "30": 155000,
};

function newCreatura() {
  return {
    id: "",
    nome: "Nuova Creatura",
    tipo: "Mostro", // "Mostro" | "PNG"
    taglia: "Media",
    allineamento: "",
    gs: "1",
    ca: 10,
    caNote: "",
    pfMax: 10,
    pfAttuali: 10,
    pfFormula: "",
    velocita: "9 m",
    abilita: { FOR: 10, DES: 10, COS: 10, INT: 10, SAG: 10, CAR: 10 },
    tiriSalvezza: "",
    competenzeAbilita: "",
    resistenze: "",
    immunitaDanno: "",
    immunitaCondizione: "",
    sensi: "",
    linguaggi: "",
    tratti: [], // { id, nome, desc }
    azioni: [], // { id, nome, desc, attacco (bool), bonusAttacco, danno, tipoDanno }
    azioniLeggendarie: [], // { id, nome, desc }
    reazioni: [], // { id, nome, desc }
    note: "",
    immagineUrl: "",
    custom: true,
  };
}

export { newCreatura, GS_BONUS_COMPETENZA, GS_PUNTI_ESPERIENZA };
