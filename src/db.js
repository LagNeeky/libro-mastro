// Strato di salvataggio persistente basato su IndexedDB (tramite la libreria idb-keyval).
// Ogni "categoria" (schede, razze, incantesimi, ecc.) viene salvata sotto una propria chiave.

import { get, set } from "idb-keyval";

export async function loadState(key, defaultValue) {
  try {
    const stored = await get(key);
    return stored !== undefined ? stored : defaultValue;
  } catch (err) {
    console.error("Errore nel caricamento di", key, err);
    return defaultValue;
  }
}

export async function saveState(key, value) {
  try {
    await set(key, value);
  } catch (err) {
    console.error("Errore nel salvataggio di", key, err);
  }
}

// Unisce il catalogo ufficiale (aggiornato con l'app) con i contenuti homebrew
// gia' salvati dal giocatore: il contenuto ufficiale viene sempre sostituito con
// l'ultima versione portata dall'app (cosi' le correzioni/aggiunte arrivano a tutti),
// mentre le voci homebrew del giocatore (custom: true) restano sempre intatte.
export function mergeOfficialData(stored, defaults) {
  if (!Array.isArray(stored)) return defaults;
  const custom = stored.filter((item) => item.custom);
  return [...defaults, ...custom];
}
