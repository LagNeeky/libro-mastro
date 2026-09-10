import React, { useState, useRef } from 'react';
import { styles } from '../styles.js';
import { uid } from '../utils/helpers.js';
import { FormModal } from './shared.jsx';
import ExportSelectModal from './ExportSelectModal.jsx';
import { leggiFileImportati, smistaEImporta } from '../utils/importExport.js';

function TalentiCatalogoTab({ talentiCatalogo, setTalentiCatalogo, openDetail, pg, updatePg }) {
  const [showForm, setShowForm] = useState(false);
  const [modificaId, setModificaId] = useState(null);
  const [form, setForm] = useState({ nome: "", prerequisito: "", desc: "" });
  const [query, setQuery] = useState("");
  const [queryEffetto, setQueryEffetto] = useState("");
  const [showExport, setShowExport] = useState(false);
  const importInputRef = useRef(null);
  const [importMsg, setImportMsg] = useState("");

  const gestisciImport = async (e) => {
    const files = e.target.files;
    if (!files || !files.length) return;
    const risultati = await leggiFileImportati(files);
    const { importati, tipiIgnorati } = smistaEImporta(risultati, { talento: setTalentiCatalogo }, uid);
    setImportMsg(`Importati ${importati} elementi.${tipiIgnorati.length ? ` Ignorati alcuni file di tipo non compatibile con questa pagina: ${tipiIgnorati.join(", ")}.` : ""}`);
    e.target.value = "";
  };

  const apriNuovo = () => { setModificaId(null); setForm({ nome: "", prerequisito: "", desc: "" }); setShowForm(true); };
  const apriModifica = (t) => { setModificaId(t.id); setForm({ nome: t.nome, prerequisito: t.prerequisito, desc: t.desc }); setShowForm(true); };

  const salva = () => {
    if (!form.nome.trim()) return;
    if (modificaId) {
      setTalentiCatalogo((s) => s.map((t) => (t.id === modificaId ? { ...t, nome: form.nome, prerequisito: form.prerequisito, desc: form.desc, custom: true } : t)));
    } else {
      setTalentiCatalogo((s) => [...s, { id: uid(), nome: form.nome, prerequisito: form.prerequisito, desc: form.desc, custom: true }]);
    }
    setForm({ nome: "", prerequisito: "", desc: "" });
    setModificaId(null);
    setShowForm(false);
  };

  const isOnPg = (talentoId) => pg.talenti.some((t) => t.catalogoId === talentoId);
  const toggleTalentoSuScheda = (talento) => {
    if (isOnPg(talento.id)) {
      updatePg({ talenti: pg.talenti.filter((t) => t.catalogoId !== talento.id) });
    } else {
      const auto = talento.effettoAuto;
      updatePg({ talenti: [...pg.talenti, { id: uid(), catalogoId: talento.id, nome: talento.nome, desc: talento.desc, applicaA: auto ? auto.applicaA : "nessuno", valore: auto ? auto.valore : 0 }] });
    }
  };

  const q = query.toLowerCase();
  const qEffetto = queryEffetto.toLowerCase();
  const filtrati = talentiCatalogo
    .filter((t) => t.nome.toLowerCase().includes(q))
    .filter((t) => !qEffetto.trim() || t.desc.toLowerCase().includes(qEffetto) || (t.prerequisito || "").toLowerCase().includes(qEffetto));

  return (
    <div style={styles.panel}>
      <h2 style={styles.panelTitle}>Talenti</h2>
      <p style={styles.hint}>Catalogo di riferimento dei talenti disponibili. Usa il tasto su ogni scheda per aggiungerlo (o toglierlo) direttamente dalla sezione "Talenti" del personaggio attivo.</p>
      <input style={styles.searchInput} value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Cerca un talento per nome..." />
      <input style={{ ...styles.searchInput, marginTop: 6 }} value={queryEffetto} onChange={(e) => setQueryEffetto(e.target.value)} placeholder="Cerca per effetto o descrizione (es. 'iniziativa', '+2', 'armatura pesante')..." />
      <button style={styles.primaryBtn} onClick={apriNuovo}>+ Nuovo talento</button>
      <div style={styles.pgSelectorRow}>
        <button style={styles.smallBtn} onClick={() => setShowExport(true)}>⬇ Esporta</button>
        <button style={styles.smallBtn} onClick={() => importInputRef.current?.click()}>⬆ Importa</button>
        <input ref={importInputRef} type="file" accept=".json,.zip" multiple style={{ display: "none" }} onChange={gestisciImport} />
      </div>
      {importMsg && <div style={styles.hint}>{importMsg}</div>}
      {showExport && (
        <ExportSelectModal nomeZip="talenti_libro_mastro" onClose={() => setShowExport(false)} gruppi={[{ tipo: "talento", etichetta: "Talenti", elementi: talentiCatalogo }]} />
      )}
      <div style={{ ...styles.cardGrid, marginTop: 14 }}>
        {filtrati.map((t) => (
          <div key={t.id} style={styles.dataCard}>
            <button style={styles.dataCardTitleBtn} onClick={() => openDetail({ type: "talento", data: t })}>{t.nome}{t.custom ? " ★" : ""}</button>
            <div style={styles.hint}>{t.prerequisito ? `Richiede: ${t.prerequisito}` : "Nessun prerequisito"}</div>
            <div style={styles.cardBtnRow}>
              <button style={{ ...styles.smallBtn, ...(isOnPg(t.id) ? styles.smallBtnActive : {}) }} onClick={() => toggleTalentoSuScheda(t)}>{isOnPg(t.id) ? "✓ Sulla scheda (rimuovi)" : `+ Aggiungi a ${pg.nome || "scheda"}`}</button>
              <button style={styles.smallBtn} onClick={() => apriModifica(t)}>✏️ Modifica</button>
              {t.custom && <button style={styles.smallDangerBtn} onClick={() => setTalentiCatalogo((s) => s.filter((x) => x.id !== t.id))}>Rimuovi dal catalogo</button>}
            </div>
          </div>
        ))}
      </div>

      {showForm && (
        <FormModal title={modificaId ? "Modifica talento" : "Nuovo talento homebrew"} onClose={() => setShowForm(false)} onSubmit={salva} canSubmit={!!form.nome.trim()}>
          <input style={{ ...styles.formInput, display: "block", width: "100%", marginBottom: 8 }} placeholder="Nome talento" value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} />
          <input style={{ ...styles.formInput, display: "block", width: "100%", marginBottom: 8 }} placeholder="Prerequisito (lascia vuoto se nessuno)" value={form.prerequisito} onChange={(e) => setForm({ ...form, prerequisito: e.target.value })} />
          <textarea style={styles.formTextarea} placeholder="Descrizione ed effetto" value={form.desc} onChange={(e) => setForm({ ...form, desc: e.target.value })} />
        </FormModal>
      )}
    </div>
  );
}

export default TalentiCatalogoTab;
