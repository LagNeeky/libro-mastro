import React, { useState } from 'react';
import { styles } from '../styles.js';
import { uid } from '../utils/helpers.js';
import { AutoTextarea } from './shared.jsx';

function DiarioSessioneTab({ sessioni, setSessioni }) {
  const [attivaId, setAttivaId] = useState(sessioni[0]?.id || null);
  const sessione = sessioni.find((s) => s.id === attivaId);

  const aggiungiSessione = () => {
    const numero = sessioni.length ? Math.max(...sessioni.map((s) => s.numero || 0)) + 1 : 1;
    const nuova = { id: uid(), numero, data: "", titolo: `Sessione ${numero}`, riassunto: "" };
    setSessioni([nuova, ...sessioni]);
    setAttivaId(nuova.id);
  };
  const aggiornaSessione = (id, patch) => setSessioni(sessioni.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  const rimuoviSessione = (id) => { setSessioni(sessioni.filter((s) => s.id !== id)); if (attivaId === id) setAttivaId(null); };

  return (
    <div style={styles.schedeLayout}>
      <aside style={styles.sidebar}>
        <div style={styles.sidebarTitle}>Sessioni di Gioco</div>
        {[...sessioni].sort((a, b) => (b.numero || 0) - (a.numero || 0)).map((s) => (
          <div key={s.id} style={{ ...styles.pgListItem, ...(s.id === attivaId ? styles.pgListItemActive : {}) }}>
            <button style={styles.pgListBtn} onClick={() => setAttivaId(s.id)}><span style={styles.pgListName}>#{s.numero} — {s.titolo || "Senza titolo"}</span></button>
            <button style={styles.pgDelBtn} onClick={() => rimuoviSessione(s.id)}>✕</button>
          </div>
        ))}
        <button style={styles.primaryBtn} onClick={aggiungiSessione}>+ Nuova Sessione</button>
      </aside>
      <section style={styles.sheet}>
        {sessione ? (
          <>
            <div style={styles.invRow}>
              <input style={{ ...styles.invNome, flex: 2, fontWeight: 700, fontSize: 15 }} placeholder="Titolo della sessione" value={sessione.titolo} onChange={(e) => aggiornaSessione(sessione.id, { titolo: e.target.value })} />
              <input style={styles.invPos} type="date" value={sessione.data} onChange={(e) => aggiornaSessione(sessione.id, { data: e.target.value })} />
              <div style={styles.invSpacer} />
            </div>
            <div style={{ marginTop: 16 }}>
              <div style={styles.columnTitleLeft}>Cosa è successo</div>
              <AutoTextarea style={{ ...styles.notes, minHeight: 320 }} value={sessione.riassunto} onChange={(e) => aggiornaSessione(sessione.id, { riassunto: e.target.value })} placeholder="Riassunto degli eventi, decisioni prese dal gruppo, combattimenti, PNG incontrati, cose da ricordare per la prossima volta..." />
            </div>
          </>
        ) : (
          <div style={styles.hint}>Seleziona una sessione dalla lista o creane una nuova per iniziare a scrivere il diario.</div>
        )}
      </section>
    </div>
  );
}

export default DiarioSessioneTab;
