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
// gia' salvati dal giocatore: aggiunge le voci ufficiali mancanti (es. dopo un
// aggiornamento dell'app) senza mai toccare le voci homebrew esistenti.
export function mergeOfficialData(stored, defaults) {
  if (!Array.isArray(stored)) return defaults;
  const byId = new Map(stored.map((item) => [item.id, item]));
  defaults.forEach((item) => {
    if (!byId.has(item.id)) byId.set(item.id, item);
  });
  return Array.from(byId.values());
}
