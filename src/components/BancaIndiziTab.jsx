import React, { useState } from 'react';
import { styles } from '../styles.js';
import { uid } from '../utils/helpers.js';
import { AutoTextarea } from './shared.jsx';

function BancaIndiziTab({ indizi, setIndizi }) {
  const [filtro, setFiltro] = useState("tutti"); // tutti | da_rivelare | rivelati
  const [query, setQuery] = useState("");

  const aggiungiIndizio = () => setIndizi([...indizi, { id: uid(), titolo: "Nuovo indizio", descrizione: "", collegatoA: "", rivelato: false }]);
  const aggiornaIndizio = (id, patch) => setIndizi(indizi.map((i) => (i.id === id ? { ...i, ...patch } : i)));
  const rimuoviIndizio = (id) => setIndizi(indizi.filter((i) => i.id !== id));

  const elenco = indizi
    .filter((i) => (filtro === "tutti" ? true : filtro === "rivelati" ? i.rivelato : !i.rivelato))
    .filter((i) => i.titolo.toLowerCase().includes(query.toLowerCase()) || i.descrizione.toLowerCase().includes(query.toLowerCase()));

  return (
    <div style={styles.panel}>
      <h2 style={styles.panelTitle}>Banca Indizi & Segreti</h2>
      <p style={styles.hint}>Tieni traccia di cosa i giocatori sanno già e cosa devi ancora rivelare, per non perdere il filo di indizi e segreti importanti per la trama.</p>

      <div style={styles.pgSelectorRow}>
        <input style={styles.searchInput} placeholder="Cerca tra gli indizi..." value={query} onChange={(e) => setQuery(e.target.value)} />
        <select style={styles.pgSelect} value={filtro} onChange={(e) => setFiltro(e.target.value)}>
          <option value="tutti">Tutti</option>
          <option value="da_rivelare">Solo da rivelare</option>
          <option value="rivelati">Solo già rivelati</option>
        </select>
        <button style={styles.primaryBtn} onClick={aggiungiIndizio}>+ Nuovo Indizio</button>
      </div>

      <div style={styles.sectionDivider} />

      {elenco.length === 0 ? (
        <p style={styles.hint}>Nessun indizio da mostrare con questo filtro.</p>
      ) : (
        elenco.map((i) => (
          <div key={i.id} style={{ ...styles.itemGroup, ...(i.rivelato ? { opacity: 0.6 } : {}) }}>
            <div style={styles.itemRow}>
              <button
                style={{ ...styles.smallBtn, ...(i.rivelato ? styles.smallBtnActive : {}) }}
                onClick={() => aggiornaIndizio(i.id, { rivelato: !i.rivelato })}
                title="Segna come rivelato o da rivelare"
              >
                {i.rivelato ? "✓ Rivelato" : "○ Da rivelare"}
              </button>
              <input style={{ ...styles.overrideInput, flex: 1, fontWeight: 700 }} value={i.titolo} onChange={(e) => aggiornaIndizio(i.id, { titolo: e.target.value })} />
              <input style={{ ...styles.overrideInput, minWidth: 160 }} placeholder="Collegato a... (es. PNG, trama)" value={i.collegatoA} onChange={(e) => aggiornaIndizio(i.id, { collegatoA: e.target.value })} />
              <button style={styles.removeX} onClick={() => rimuoviIndizio(i.id)}>✕</button>
            </div>
            <AutoTextarea style={styles.itemNoteInput} placeholder="Descrizione dell'indizio o del segreto..." value={i.descrizione} onChange={(e) => aggiornaIndizio(i.id, { descrizione: e.target.value })} />
          </div>
        ))
      )}
    </div>
  );
}

export default BancaIndiziTab;
