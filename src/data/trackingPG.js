// Modello dati per il Tracciamento PG (lato Master): dati narrativi, separati dalla Scheda PG meccanica del giocatore

function newTrackingPG(pgId) {
  return {
    id: "",
    pgId,
    legami: "",
    obiettiviPersonali: "",
    evoluzioneStoria: "",
    segreti: "",
    note: "",
  };
}

export { newTrackingPG };
