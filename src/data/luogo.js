// Modello dati per il catalogo Luoghi (continenti, regioni, città, taverne, dungeon...)

function newLuogo() {
  return {
    id: "",
    nome: "Nuovo Luogo",
    tipo: "Città", // Continente | Regione | Città | Villaggio | Taverna | Dungeon | Altro
    luogoPadreId: null, // per la gerarchia: es. una città dentro una regione
    descrizione: "",
    agganciTrama: "",
    fazioneControllanteId: null,
    note: "",
    custom: true,
  };
}

export { newLuogo };
