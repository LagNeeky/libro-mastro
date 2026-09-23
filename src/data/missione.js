// Modello dati per il catalogo Missioni

const STATI_MISSIONE = ["Disponibile", "In Corso", "Completata", "Fallita"];

function newMissione() {
  return {
    id: "",
    nome: "Nuova Missione",
    principale: false,
    stato: "Disponibile",
    descrizione: "",
    obiettivi: "",
    ricompense: "",
    luogoId: null,
    fazioneId: null,
    pngCollegatoId: null,
    note: "",
    custom: true,
  };
}

export { newMissione, STATI_MISSIONE };
