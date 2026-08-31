import React, { useState } from 'react';
import { styles } from '../styles.js';
import { uid } from '../utils/helpers.js';
import { FormModal } from './shared.jsx';

function TalentiCatalogoTab({ talentiCatalogo, setTalentiCatalogo, openDetail, pg, updatePg }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ nome: "", prerequisito: "", desc: "" });
  const [query, setQuery] = useState("");

  const salva = () => {
    if (!form.nome.trim()) return;
    setTalentiCatalogo((s) => [...s, { id: uid(), nome: form.nome, prerequisito: form.prerequisito, desc: form.desc, custom: true }]);
    setForm({ nome: "", prerequisito: "", desc: "" });
    setShowForm(false);
  };

  const isOnPg = (talentoId) => pg.talenti.some((t) => t.catalogoId === talentoId);
  const toggleTalentoSuScheda = (talento) => {
    if (isOnPg(talento.id)) {
      updatePg({ talenti: pg.talenti.filter((t) => t.catalogoId !== talento.id) });
    } else {
      updatePg({ talenti: [...pg.talenti, { id: uid(), catalogoId: talento.id, nome: talento.nome, desc: talento.desc, applicaA: "nessuno", valore: 0 }] });
    }
  };

  const q = query.toLowerCase();
  const filtrati = talentiCatalogo.filter((t) => t.nome.toLowerCase().includes(q));

  return (
    <div style={styles.panel}>
      <h2 style={styles.panelTitle}>Talenti</h2>
      <p style={styles.hint}>Catalogo di riferimento dei talenti disponibili. Usa il tasto su ogni scheda per aggiungerlo (o toglierlo) direttamente dalla sezione "Talenti" del personaggio attivo.</p>
      <input style={styles.searchInput} value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Cerca un talento..." />
      <button style={styles.primaryBtn} onClick={() => setShowForm(true)}>+ Nuovo talento</button>
      <div style={{ ...styles.cardGrid, marginTop: 14 }}>
        {filtrati.map((t) => (
          <div key={t.id} style={styles.dataCard}>
            <button style={styles.dataCardTitleBtn} onClick={() => openDetail({ type: "talento", data: t })}>{t.nome}{t.custom ? " ★" : ""}</button>
            <div style={styles.hint}>{t.prerequisito ? `Richiede: ${t.prerequisito}` : "Nessun prerequisito"}</div>
            <div style={styles.cardBtnRow}>
              <button style={{ ...styles.smallBtn, ...(isOnPg(t.id) ? styles.smallBtnActive : {}) }} onClick={() => toggleTalentoSuScheda(t)}>{isOnPg(t.id) ? "✓ Sulla scheda (rimuovi)" : `+ Aggiungi a ${pg.nome || "scheda"}`}</button>
              {t.custom && <button style={styles.smallDangerBtn} onClick={() => setTalentiCatalogo((s) => s.filter((x) => x.id !== t.id))}>Rimuovi dal catalogo</button>}
            </div>
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
