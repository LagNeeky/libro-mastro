import React, { useState } from 'react';
import { styles } from '../styles.js';
import { uid } from '../utils/helpers.js';
import { FormModal } from './shared.jsx';

function TrasfondiTab({ backgrounds, setBackgrounds, openDetail }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ nome: "", abilita: "", strumenti: "", lingue: 0, equipaggiamento: "", privilegioNome: "", privilegioDesc: "" });
  const [query, setQuery] = useState("");

  const salva = () => {
    if (!form.nome.trim()) return;
    setBackgrounds((s) => [...s, {
      id: uid(),
      nome: form.nome,
      abilita: form.abilita.split(",").map((x) => x.trim()).filter(Boolean),
      strumenti: form.strumenti.split(",").map((x) => x.trim()).filter(Boolean),
      lingue: Number(form.lingue) || 0,
      equipaggiamento: form.equipaggiamento,
      privilegio: { nome: form.privilegioNome, desc: form.privilegioDesc },
      custom: true,
    }]);
    setForm({ nome: "", abilita: "", strumenti: "", lingue: 0, equipaggiamento: "", privilegioNome: "", privilegioDesc: "" });
    setShowForm(false);
  };

  const q = query.toLowerCase();
  const filtrati = backgrounds.filter((b) => b.nome.toLowerCase().includes(q));

  return (
    <div style={styles.panel}>
      <h2 style={styles.panelTitle}>Background</h2>
      <p style={styles.hint}>Il trasfondo di un personaggio definisce due competenze in abilità, eventuali strumenti, e un privilegio narrativo. Puoi collegarlo a un personaggio dalla Carta d'Identità.</p>
      <input style={styles.searchInput} value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Cerca un trasfondo..." />
      <button style={styles.primaryBtn} onClick={() => setShowForm(true)}>+ Nuovo trasfondo</button>
      <div style={{ ...styles.cardGrid, marginTop: 14 }}>
        {filtrati.map((b) => (
          <div key={b.id} style={styles.dataCard}>
            <button style={styles.dataCardTitleBtn} onClick={() => openDetail({ type: "trasfondo", data: b })}>{b.nome}{b.custom ? " ★" : ""}</button>
            <div style={styles.hint}>Competenze: {b.abilita.join(", ") || "—"}</div>
            {b.custom && <div style={styles.cardBtnRow}><button style={styles.smallDangerBtn} onClick={() => setBackgrounds((s) => s.filter((x) => x.id !== b.id))}>Rimuovi</button></div>}
          </div>
        ))}
      </div>

      {showForm && (
        <FormModal title="Nuovo trasfondo homebrew" onClose={() => setShowForm(false)} onSubmit={salva} canSubmit={!!form.nome.trim()}>
          <input style={{ ...styles.formInput, display: "block", width: "100%", marginBottom: 8 }} placeholder="Nome trasfondo" value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} />
          <input style={{ ...styles.formInput, display: "block", width: "100%", marginBottom: 8 }} placeholder="Competenze in abilità (separate da virgola)" value={form.abilita} onChange={(e) => setForm({ ...form, abilita: e.target.value })} />
          <div style={styles.formRow}>
            <input style={styles.formInput} placeholder="Strumenti (separati da virgola)" value={form.strumenti} onChange={(e) => setForm({ ...form, strumenti: e.target.value })} />
            <input type="number" style={{ ...styles.formInput, width: 90 }} placeholder="N. lingue" value={form.lingue} onChange={(e) => setForm({ ...form, lingue: e.target.value })} />
          </div>
          <textarea style={{ ...styles.formTextarea, minHeight: 60 }} placeholder="Equipaggiamento di partenza" value={form.equipaggiamento} onChange={(e) => setForm({ ...form, equipaggiamento: e.target.value })} />
          <input style={{ ...styles.formInput, display: "block", width: "100%", marginBottom: 8 }} placeholder="Nome del privilegio" value={form.privilegioNome} onChange={(e) => setForm({ ...form, privilegioNome: e.target.value })} />
          <textarea style={styles.formTextarea} placeholder="Descrizione del privilegio" value={form.privilegioDesc} onChange={(e) => setForm({ ...form, privilegioDesc: e.target.value })} />
        </FormModal>
      )}
    </div>
  );
}

export default TrasfondiTab;
