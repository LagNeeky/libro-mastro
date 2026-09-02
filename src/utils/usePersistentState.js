import { useState, useEffect, useRef } from "react";
import { loadState, saveState, mergeOfficialData } from "../db.js";

// Stato semplice salvato/caricato da IndexedDB (per schede, appunti, mappe, documenti, ordine delle tab...).
// Il parametro opzionale "migrate" trasforma il valore appena caricato prima di usarlo (es. per
// aggiungere ai personaggi salvati i campi introdotti da aggiornamenti successivi dell'app).
export function usePersistentState(key, defaultValue, migrate) {
  const [state, setState] = useState(defaultValue);
  const loadedRef = useRef(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let attivo = true;
    loadState(key, defaultValue).then((stored) => {
      if (!attivo) return;
      setState(migrate ? migrate(stored) : stored);
      loadedRef.current = true;
      setLoaded(true);
    });
    return () => { attivo = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  useEffect(() => {
    if (!loadedRef.current) return; // evita di sovrascrivere prima che il caricamento iniziale sia completo
    saveState(key, state);
  }, [key, state]);

  return [state, setState, loaded];
}

// Stato per i "cataloghi" ufficiali (razze, classi, incantesimi, armi...): al caricamento
// unisce automaticamente eventuali nuove voci ufficiali aggiunte con un aggiornamento
// dell'app, senza mai toccare i contenuti homebrew gia' salvati dal giocatore.
export function useCatalogState(key, defaults) {
  const [state, setState] = useState(defaults);
  const loadedRef = useRef(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let attivo = true;
    loadState(key, null).then((stored) => {
      if (!attivo) return;
      const merged = stored ? mergeOfficialData(stored, defaults) : defaults;
      setState(merged);
      loadedRef.current = true;
      setLoaded(true);
    });
    return () => { attivo = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  useEffect(() => {
    if (!loadedRef.current) return;
    saveState(key, state);
  }, [key, state]);

  return [state, setState, loaded];
}
