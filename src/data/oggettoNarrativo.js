// Modello dati per il catalogo Oggetti Narrativi (armi magiche, reliquie, artefatti con una storia)

function newOggettoNarrativo() {
  return {
    id: "",
    nome: "Nuovo Oggetto",
    tipo: "Arma", // Arma | Armatura | Accessorio | Reliquia | Altro
    rarita: "Non Comune",
    statistiche: "",
    descrizione: "",
    retroscena: "",
    proprietarioId: null, // PNG che lo possiede attualmente
    luogoId: null, // dove si trova, se non e' con un PNG
    note: "",
    custom: true,
  };
}

export { newOggettoNarrativo };
