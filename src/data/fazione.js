// Modello dati per il catalogo Fazioni & Organizzazioni

function newFazione() {
  return {
    id: "",
    nome: "Nuova Fazione",
    tipo: "Gilda", // Gilda | Culto | Regno | Ordine Cavalleresco | Altro
    allineamento: "",
    descrizione: "",
    obiettivi: "",
    risorse: "",
    luogoBaseId: null,
    alleati: [], // array di id di altre fazioni
    nemici: [], // array di id di altre fazioni
    note: "",
    custom: true,
  };
}

export { newFazione };
