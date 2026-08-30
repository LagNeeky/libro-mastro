import React, { useState } from 'react';
import { styles } from '../styles.js';
import { ABILITIES, ABILITY_LABELS, fmt, zeroBonus, uid, parseTratti } from '../utils/helpers.js';
import { FormModal, NumInput } from './shared.jsx';

function RazzeTab({ razze, setRazze, sottorazze, setSottorazze, openDetail }) {
  const [showRForm, setShowRForm] = useState(false);
  const [showSForm, setShowSForm] = useState(null);
  const [rForm, setRForm] = useState({ nome: "", velocita: "9 m", bonus: zeroBonus(), tratti: "" });
  const [sForm, setSForm] = useState({ nome: "", bonus: zeroBonus(), tratti: "" });
  const [query, setQuery] = useState("");

  const salvaRazza = () => { if (!rForm.nome.trim()) return; setRazze((s) => [...s, { id: uid(), nome: rForm.nome, velocita: rForm.velocita || "9 m", bonus: rForm.bonus, tratti: parseTratti(rForm.tratti), custom: true }]); setRForm({ nome: "", velocita: "9 m", bonus: zeroBonus(), tratti: "" }); setShowRForm(false); };
  const salvaSottorazza = (razzaId) => { if (!sForm.nome.trim()) return; setSottorazze((s) => [...s, { id: uid(), razzaId, nome: sForm.nome, bonus: sForm.bonus, tratti: parseTratti(sForm.tratti), custom: true }]); setSForm({ nome: "", bonus: zeroBonus(), tratti: "" }); setShowSForm(null); };

  const q = query.toLowerCase();
  const razzeF = razze.filter((r) => r.nome.toLowerCase().includes(q) || sottorazze.some((s) => s.razzaId === r.id && s.nome.toLowerCase().includes(q)));

  return (
    <div style={styles.panel}>
      <h2 style={styles.panelTitle}>Razze</h2>
      <p style={styles.hint}>Ogni razza/sottorazza alimenta automaticamente le caratteristiche e i tratti sulla scheda (via "Sincronizza" nella sezione Tratti Razziali).</p>
      <input style={styles.searchInput} value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Cerca una razza o sottorazza..." />
      <button style={styles.primaryBtn} onClick={() => setShowRForm(true)}>+ Nuova razza</button>
      <div style={{ ...styles.cardGrid, marginTop: 14 }}>
        {razzeF.map((r) => (
          <div key={r.id} style={styles.dataCard}>
            <button style={styles.dataCardTitleBtn} onClick={() => openDetail({ type: "razza", data: r })}>{r.nome}{r.custom ? " ★" : ""}</button>
            <div style={styles.hint}>{ABILITIES.filter((a) => r.bonus[a]).map((a) => `${fmt(r.bonus[a])} ${a}`).join(", ") || "nessun bonus"}</div>
            <div style={styles.cardBtnRow}>
              <button style={styles.smallBtn} onClick={() => setShowSForm(r.id)}>+ Sottorazza</button>
              {r.custom && <button style={styles.smallDangerBtn} onClick={() => setRazze((s) => s.filter((x) => x.id !== r.id))}>Rimuovi</button>}
            </div>
            {sottorazze.filter((s) => s.razzaId === r.id).length > 0 && (
              <div style={{ marginTop: 8 }}>
                {sottorazze.filter((s) => s.razzaId === r.id).map((s) => (
                  <div key={s.id} style={styles.subRow}>
                    <button style={styles.itemName} onClick={() => openDetail({ type: "sottorazza", data: s })}>{s.nome}{s.custom ? " ★" : ""}</button>
                    {s.custom && <button style={styles.pgDelBtn} onClick={() => setSottorazze((x) => x.filter((y) => y.id !== s.id))}>✕</button>}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {showRForm && (
        <FormModal title="Nuova razza homebrew" onClose={() => setShowRForm(false)} onSubmit={salvaRazza} canSubmit={!!rForm.nome.trim()}>
          <input style={{ ...styles.formInput, display: "block", width: "100%", marginBottom: 8 }} placeholder="Nome razza" value={rForm.nome} onChange={(e) => setRForm({ ...rForm, nome: e.target.value })} />
          <input style={{ ...styles.formInput, display: "block", width: 140, marginBottom: 8 }} placeholder="Velocità (es. 9 m)" value={rForm.velocita} onChange={(e) => setRForm({ ...rForm, velocita: e.target.value })} />
          <div style={styles.formRow}>{ABILITIES.map((a) => <label key={a} style={styles.miniField}>{a}<NumInput min={-5} max={10} style={styles.smallNumInput} value={rForm.bonus[a]} onCommit={(n) => setRForm({ ...rForm, bonus: { ...rForm.bonus, [a]: n } })} /></label>)}</div>
          <textarea style={styles.formTextarea} placeholder={"Tratti, uno per riga (formato Nome: descrizione)"} value={rForm.tratti} onChange={(e) => setRForm({ ...rForm, tratti: e.target.value })} />
        </FormModal>
      )}
      {showSForm && (
        <FormModal title="Nuova sottorazza homebrew" onClose={() => setShowSForm(null)} onSubmit={() => salvaSottorazza(showSForm)} canSubmit={!!sForm.nome.trim()}>
          <input style={{ ...styles.formInput, display: "block", width: "100%", marginBottom: 8 }} placeholder="Nome sottorazza" value={sForm.nome} onChange={(e) => setSForm({ ...sForm, nome: e.target.value })} />
          <div style={styles.formRow}>{ABILITIES.map((a) => <label key={a} style={styles.miniField}>{a}<NumInput min={-5} max={10} style={styles.smallNumInput} value={sForm.bonus[a]} onCommit={(n) => setSForm({ ...sForm, bonus: { ...sForm.bonus, [a]: n } })} /></label>)}</div>
          <textarea style={styles.formTextarea} placeholder={"Tratti, uno per riga (formato Nome: descrizione)"} value={sForm.tratti} onChange={(e) => setSForm({ ...sForm, tratti: e.target.value })} />
        </FormModal>
      )}
    </div>
  );
}


export default RazzeTab;
