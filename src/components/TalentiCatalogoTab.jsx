import React, { useState } from 'react';
import { styles } from '../styles.js';
import { uid } from '../utils/helpers.js';
import { FormModal } from './shared.jsx';

function TalentiCatalogoTab({ talentiCatalogo, setTalentiCatalogo, openDetail }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ nome: "", prerequisito: "", desc: "" });
  const [query, setQuery] = useState("");

  const salva = () => {
    if (!form.nome.trim()) return;
    setTalentiCatalogo((s) => [...s, { id: uid(), nome: form.nome, prerequisito: form.prerequisito, desc: form.desc, custom: true }]);
    setForm({ nome: "", prerequisito: "", desc: "" });
    setShowForm(false);
  };

  const q = query.toLowerCase();
  const filtrati = talentiCatalogo.filter((t) => t.nome.toLowerCase().includes(q));

  return (
    <div style={styles.panel}>
      <h2 style={styles.panelTitle}>Talenti</h2>
      <p style={styles.hint}>Catalogo di riferimento dei talenti disponibili. Per assegnarne uno a un personaggio, vai sulla sua Scheda PG, sezione "Talenti", e copia nome/descrizione da qui.</p>
      <input style={styles.searchInput} value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Cerca un talento..." />
      <button style={styles.primaryBtn} onClick={() => setShowForm(true)}>+ Nuovo talento</button>
      <div style={{ ...styles.cardGrid, marginTop: 14 }}>
        {filtrati.map((t) => (
          <div key={t.id} style={styles.dataCard}>
            <button style={styles.dataCardTitleBtn} onClick={() => openDetail({ type: "talento", data: t })}>{t.nome}{t.custom ? " ★" : ""}</button>
            <div style={styles.hint}>{t.prerequisito ? `Richiede: ${t.prerequisito}` : "Nessun prerequisito"}</div>
            {t.custom && <div style={styles.cardBtnRow}><button style={styles.smallDangerBtn} onClick={() => setTalentiCatalogo((s) => s.filter((x) => x.id !== t.id))}>Rimuovi</button></div>}
          </div>
        ))}
      </div>

      {showForm && (
        <FormModal title="Nuovo talento homebrew" onClose={() => setShowForm(false)} onSubmit={salva} canSubmit={!!form.nome.trim()}>
          <input style={{ ...styles.formInput, display: "block", width: "100%", marginBottom: 8 }} placeholder="Nome talento" value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} />
          <input style={{ ...styles.formInput, display: "block", width: "100%", marginBottom: 8 }} placeholder="Prerequisito (lascia vuoto se nessuno)" value={form.prerequisito} onChange={(e) => setForm({ ...form, prerequisito: e.target.value })} />
          <textarea style={styles.formTextarea} placeholder="Descrizione ed effetto" value={form.desc} onChange={(e) => setForm({ ...form, desc: e.target.value })} />
        </FormModal>
      )}
    </div>
  );
}

export default TalentiCatalogoTab;
