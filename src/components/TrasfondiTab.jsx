import React, { useState, useRef } from 'react';
import { styles } from '../styles.js';
import { uid } from '../utils/helpers.js';
import { FormModal } from './shared.jsx';
import ExportSelectModal from './ExportSelectModal.jsx';
import { leggiFileImportati, smistaEImporta } from '../utils/importExport.js';

function TrasfondiTab({ backgrounds, setBackgrounds, openDetail }) {
  const [showForm, setShowForm] = useState(false);
  const [modificaId, setModificaId] = useState(null);
  const formVuoto = { nome: "", abilita: "", strumenti: "", lingue: 0, equipaggiamento: "", privilegioNome: "", privilegioDesc: "" };
  const [form, setForm] = useState(formVuoto);
  const [query, setQuery] = useState("");
  const [showExport, setShowExport] = useState(false);
  const importInputRef = useRef(null);
  const [importMsg, setImportMsg] = useState("");

  const apriNuovo = () => { setModificaId(null); setForm(formVuoto); setShowForm(true); };
  const apriModifica = (b) => {
    setModificaId(b.id);
    setForm({
      nome: b.nome,
      abilita: (b.abilita || []).join(", "),
      strumenti: (b.strumenti || []).join(", "),
      lingue: b.lingue || 0,
      equipaggiamento: b.equipaggiamento || "",
      privilegioNome: b.privilegio?.nome || "",
      privilegioDesc: b.privilegio?.desc || "",
    });
    setShowForm(true);
  };

  const salva = () => {
    if (!form.nome.trim()) return;
    const patch = {
      nome: form.nome,
      abilita: form.abilita.split(",").map((x) => x.trim()).filter(Boolean),
      strumenti: form.strumenti.split(",").map((x) => x.trim()).filter(Boolean),
      lingue: Number(form.lingue) || 0,
      equipaggiamento: form.equipaggiamento,
      privilegio: { nome: form.privilegioNome, desc: form.privilegioDesc },
      custom: true,
    };
    if (modificaId) setBackgrounds((s) => s.map((b) => (b.id === modificaId ? { ...b, ...patch } : b)));
    else setBackgrounds((s) => [...s, { id: uid(), ...patch }]);
    setForm(formVuoto);
    setModificaId(null);
    setShowForm(false);
  };

  const gestisciImport = async (e) => {
    const files = e.target.files;
    if (!files || !files.length) return;
    const risultati = await leggiFileImportati(files);
    const { importati, tipiIgnorati } = smistaEImporta(risultati, { background: setBackgrounds }, uid);
    setImportMsg(`Importati ${importati} elementi.${tipiIgnorati.length ? ` Ignorati alcuni file di tipo non compatibile con questa pagina: ${tipiIgnorati.join(", ")}.` : ""}`);
    e.target.value = "";
  };

  const q = query.toLowerCase();
  const filtrati = backgrounds.filter((b) => b.nome.toLowerCase().includes(q));

  return (
    <div style={styles.panel}>
      <h2 style={styles.panelTitle}>Background</h2>
      <p style={styles.hint}>Il Background di un personaggio definisce due competenze in abilità, eventuali strumenti, e un privilegio narrativo. Puoi collegarlo a un personaggio dalla Carta d'Identità.</p>
      <input style={styles.searchInput} value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Cerca un Background..." />
      <button style={{ ...styles.primaryBtn, marginBottom: 10 }} onClick={apriNuovo}>+ Nuovo Background</button>
      <div style={styles.pgSelectorRow}>
        <button style={styles.smallBtn} onClick={() => setShowExport(true)}>⬇ Esporta</button>
        <button style={styles.smallBtn} onClick={() => importInputRef.current?.click()}>⬆ Importa</button>
        <input ref={importInputRef} type="file" accept=".json,.zip" multiple style={{ display: "none" }} onChange={gestisciImport} />
      </div>
      {importMsg && <div style={styles.hint}>{importMsg}</div>}
      {showExport && (
        <ExportSelectModal nomeZip="background_libro_mastro" onClose={() => setShowExport(false)} gruppi={[{ tipo: "background", etichetta: "Background", elementi: backgrounds }]} />
      )}
      <div style={{ ...styles.cardGrid, marginTop: 14 }}>
        {filtrati.map((b) => (
          <div key={b.id} style={styles.dataCard}>
            <button style={styles.dataCardTitleBtn} onClick={() => openDetail({ type: "trasfondo", data: b })}>{b.nome}{b.custom ? " ★" : ""}</button>
            <div style={styles.hint}>Competenze: {b.abilita.join(", ") || "—"}</div>
            <div style={styles.cardBtnRow}>
              <button style={styles.smallBtn} onClick={() => apriModifica(b)}>✏️ Modifica</button>
              {b.custom && <button style={styles.smallDangerBtn} onClick={() => setBackgrounds((s) => s.filter((x) => x.id !== b.id))}>Rimuovi</button>}
            </div>
          </div>
        ))}
      </div>

      {showForm && (
        <FormModal title={modificaId ? "Modifica Background" : "Nuovo Background homebrew"} onClose={() => setShowForm(false)} onSubmit={salva} canSubmit={!!form.nome.trim()}>
          <input style={{ ...styles.formInput, display: "block", width: "100%", marginBottom: 8 }} placeholder="Nome Background" value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} />
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
