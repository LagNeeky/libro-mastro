import React, { useState, useMemo } from 'react';
import { styles } from '../styles.js';
import { RULES } from '../data/regole.js';
import { RuleTable } from './shared.jsx';

function RegoleTab({ openDetail }) {
  const [query, setQuery] = useState("");
  const filtrate = useMemo(() => {
    if (!query.trim()) return RULES;
    const q = query.toLowerCase();
    return RULES.filter((r) => r.titolo.toLowerCase().includes(q) || (r.testo || "").toLowerCase().includes(q) || (r.categoria || "").toLowerCase().includes(q));
  }, [query]);
  const categorie = useMemo(() => {
    const ordine = ["Regole Base", "Economia", "Lancio Incantesimi", "Inventario", "Azioni"];
    const gruppi = {};
    filtrate.forEach((r) => { (gruppi[r.categoria] = gruppi[r.categoria] || []).push(r); });
    return ordine.filter((c) => gruppi[c] && gruppi[c].length).map((c) => ({ nome: c, voci: gruppi[c] }));
  }, [filtrate]);

  return (
    <div style={styles.panel}>
      <h2 style={styles.panelTitle}>Regolamento di riferimento</h2>
      <input style={styles.searchInput} value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Cerca una regola, condizione o tabella..." />
      {categorie.map((cat) => (
        <div key={cat.nome}>
          <div style={styles.sectionLabel}>{cat.nome}</div>
          <div style={styles.cardGrid4}>
            {cat.voci.map((r) => (
              <button key={r.titolo} style={styles.dataCardClickable} onClick={() => openDetail({ type: "regola", data: { ...r, nome: r.titolo } })}>
                <span style={styles.dataCardTitleBtn}>{r.titolo}</span>
              </button>
            ))}
          </div>
        </div>
      ))}
      {categorie.length === 0 && <div style={styles.hint}>Nessun risultato per questa ricerca.</div>}
    </div>
  );
}


export default RegoleTab;
