import React, { useState, useMemo, useRef } from 'react';
import { styles } from '../styles.js';
import { ABILITIES, ABILITY_LABELS, uid } from '../utils/helpers.js';
import { FormModal } from './shared.jsx';
import ExportSelectModal from './ExportSelectModal.jsx';
import { leggiFileImportati, smistaEImporta } from '../utils/importExport.js';

function IncantesimiTab({ classi, incantesimi, setIncantesimi, openDetail, pg, updatePg }) {
  const [query, setQuery] = useState("");
  const [filtroClasse, setFiltroClasse] = useState("");
  const [filtroScuola, setFiltroScuola] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const importInputRef = useRef(null);
  const [importMsg, setImportMsg] = useState("");

  const gestisciImport = async (e) => {
    const files = e.target.files;
    if (!files || !files.length) return;
    const risultati = await leggiFileImportati(files);
    const { importati, tipiIgnorati } = smistaEImporta(risultati, { incantesimo: setIncantesimi }, uid);
    setImportMsg(`Importati ${importati} elementi.${tipiIgnorati.length ? ` Ignorati alcuni file di tipo non compatibile con questa pagina: ${tipiIgnorati.join(", ")}.` : ""}`);
    e.target.value = "";
  };
  const [modificaId, setModificaId] = useState(null);
  const formVuoto = { nome: "", livello: 1, scuola: "", classi: [], tempo: "", gittata: "", componenti: "", durata: "", desc: "", danno: "", tipoDanno: "", cura: "", tiroSalvezza: "", attacco: false };
  const [form, setForm] = useState(formVuoto);

  const toggleClasseForm = (id) => setForm((f) => ({ ...f, classi: f.classi.includes(id) ? f.classi.filter((x) => x !== id) : [...f.classi, id] }));
  const apriNuovo = () => { setModificaId(null); setForm(formVuoto); setShowForm(true); };
  const apriModifica = (s) => { setModificaId(s.id); setForm({ ...formVuoto, ...s, tiroSalvezza: s.tiroSalvezza || "" }); setShowForm(true); };
  const salva = () => {
    if (!form.nome.trim()) return;
    if (modificaId) {
      setIncantesimi((s) => s.map((x) => (x.id === modificaId ? { ...x, ...form, livello: Number(form.livello), tiroSalvezza: form.tiroSalvezza || undefined, custom: true } : x)));
    } else {
      setIncantesimi((s) => [...s, { ...form, livello: Number(form.livello), tiroSalvezza: form.tiroSalvezza || undefined, id: uid(), custom: true }]);
    }
    setForm(formVuoto);
    setModificaId(null);
    setShowForm(false);
  };
  const rimuovi = (id) => setIncantesimi((s) => s.filter((x) => x.id !== id));

  const scuoleDisponibili = useMemo(() => [...new Set(incantesimi.map((s) => s.scuola).filter(Boolean))].sort(), [incantesimi]);

  const filtrati = useMemo(() => {
    const q = query.toLowerCase();
    return incantesimi
      .filter((s) => !q.trim() || s.nome.toLowerCase().includes(q) || s.scuola.toLowerCase().includes(q))
      .filter((s) => !filtroClasse || s.classi.includes(filtroClasse))
      .filter((s) => !filtroScuola || s.scuola === filtroScuola);
  }, [query, incantesimi, filtroClasse, filtroScuola]);
  const perLivello = useMemo(() => { const g = {}; filtrati.forEach((s) => { (g[s.livello] = g[s.livello] || []).push(s); }); return Object.keys(g).sort((a, b) => a - b).map((lv) => ({ lv, spells: g[lv] })); }, [filtrati]);

  return (
    <div style={styles.panel}>
      <h2 style={styles.panelTitle}>Libreria degli incantesimi</h2>
      <p style={styles.hint}>Base di incantesimi 5e, in crescita: continueremo ad aggiungerne per coprire l'intero manuale. Cerca, filtra, clicca per i dettagli, o creane di homebrew.</p>
      <div style={styles.formRow}><input style={{ ...styles.searchInput, flex: 1 }} value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Cerca per nome o scuola..." /><button style={styles.primaryBtn} onClick={apriNuovo}>+ Nuovo</button></div>
      <div style={styles.pgSelectorRow}>
        <button style={styles.smallBtn} onClick={() => setShowExport(true)}>⬇ Esporta</button>
        <button style={styles.smallBtn} onClick={() => importInputRef.current?.click()}>⬆ Importa</button>
        <input ref={importInputRef} type="file" accept=".json,.zip" multiple style={{ display: "none" }} onChange={gestisciImport} />
      </div>
      {importMsg && <div style={styles.hint}>{importMsg}</div>}
      {showExport && (
        <ExportSelectModal nomeZip="incantesimi_libro_mastro" onClose={() => setShowExport(false)} gruppi={[{ tipo: "incantesimo", etichetta: "Incantesimi", elementi: incantesimi }]} />
      )}

      <div style={styles.formRow}>
        <select style={styles.formInput} value={filtroClasse} onChange={(e) => setFiltroClasse(e.target.value)}>
          <option value="">Tutte le classi</option>
          {classi.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
        </select>
        <select style={styles.formInput} value={filtroScuola} onChange={(e) => setFiltroScuola(e.target.value)}>
          <option value="">Tutte le scuole</option>
          {scuoleDisponibili.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        {(filtroClasse || filtroScuola) && <button style={styles.smallBtn} onClick={() => { setFiltroClasse(""); setFiltroScuola(""); }}>✕ Azzera filtri</button>}
      </div>

      {perLivello.map(({ lv, spells }) => (
        <div key={lv} style={{ marginBottom: 18, marginTop: 14 }}>
          <div style={styles.sectionLabel}>{lv === "0" ? "Trucchetti" : `Livello ${lv}`}</div>
          <div style={styles.cardGrid}>
            {spells.map((s) => (
              <div key={s.id} style={styles.dataCard}>
                <button style={styles.dataCardTitleBtn} onClick={() => openDetail({ type: "incantesimo", data: s })}>{s.nome}{s.custom ? " ★" : ""}</button>
                <div style={styles.hint}>{s.scuola} · {s.classi.map((cid) => (classi.find((c) => c.id === cid) || {}).nome).filter(Boolean).join(", ") || "—"}</div>
                <div style={styles.cardBtnRow}>
                  <button style={{ ...styles.smallBtn, ...(pg.incantesimiNoti.includes(s.id) ? styles.smallBtnActive : {}) }} onClick={() => updatePg({ incantesimiNoti: pg.incantesimiNoti.includes(s.id) ? pg.incantesimiNoti.filter((x) => x !== s.id) : [...pg.incantesimiNoti, s.id] })}>{pg.incantesimiNoti.includes(s.id) ? "✓ Sulla scheda (rimuovi)" : `+ Aggiungi a ${pg.nome || "scheda"}`}</button>
                  <button style={styles.smallBtn} onClick={() => apriModifica(s)}>✏️ Modifica</button>
                  {s.custom && <button style={styles.smallDangerBtn} onClick={() => rimuovi(s.id)}>Rimuovi</button>}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {showForm && (
        <FormModal title={modificaId ? "Modifica incantesimo" : "Nuovo incantesimo"} onClose={() => setShowForm(false)} onSubmit={salva} canSubmit={!!form.nome.trim()}>
          <div style={styles.formRow}>
            <input style={{ ...styles.formInput, display: "block", width: "100%", marginBottom: 8 }} placeholder="Nome" value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} />
            <select style={{ ...styles.formInput, width: 110 }} value={form.livello} onChange={(e) => setForm({ ...form, livello: e.target.value })}>{[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((l) => <option key={l} value={l}>{l === 0 ? "Trucchetto" : `Livello ${l}`}</option>)}</select>
            <input style={styles.formInput} placeholder="Scuola" value={form.scuola} onChange={(e) => setForm({ ...form, scuola: e.target.value })} />
          </div>
          <div style={styles.formRow}>
            <input style={{ ...styles.formInput, minWidth: 110 }} placeholder="Tempo di lancio" value={form.tempo} onChange={(e) => setForm({ ...form, tempo: e.target.value })} />
            <input style={{ ...styles.formInput, minWidth: 110 }} placeholder="Gittata" value={form.gittata} onChange={(e) => setForm({ ...form, gittata: e.target.value })} />
            <input style={{ ...styles.formInput, minWidth: 110 }} placeholder="Durata" value={form.durata} onChange={(e) => setForm({ ...form, durata: e.target.value })} />
          </div>
          <div style={styles.formRow}>
            <input style={styles.formInput} placeholder="Componenti (V, S, M)" value={form.componenti} onChange={(e) => setForm({ ...form, componenti: e.target.value })} />
            <input style={styles.formInput} placeholder="Danno (opzionale, es. 2d6)" value={form.danno} onChange={(e) => setForm({ ...form, danno: e.target.value })} />
            <input style={styles.formInput} placeholder="Tipo danno" value={form.tipoDanno} onChange={(e) => setForm({ ...form, tipoDanno: e.target.value })} />
          </div>
          <div style={styles.formRow}>
            <input style={styles.formInput} placeholder="Cura (opzionale, es. 1d8)" value={form.cura} onChange={(e) => setForm({ ...form, cura: e.target.value })} />
            <select style={styles.formInput} value={form.tiroSalvezza} onChange={(e) => setForm({ ...form, tiroSalvezza: e.target.value })}><option value="">Nessun TS</option>{ABILITIES.map((a) => <option key={a} value={a}>TS {ABILITY_LABELS[a]}</option>)}</select>
            <label style={styles.checkField}><input type="checkbox" checked={form.attacco} onChange={(e) => setForm({ ...form, attacco: e.target.checked })} />Tiro per colpire</label>
          </div>
          <div style={styles.hint}>Classi:</div>
          <div style={styles.chipRow}>{classi.map((c) => <button key={c.id} onClick={() => toggleClasseForm(c.id)} style={{ ...styles.chip, ...(form.classi.includes(c.id) ? styles.chipActive : {}) }}>{c.nome}</button>)}</div>
          <textarea style={styles.formTextarea} placeholder="Descrizione ed effetto" value={form.desc} onChange={(e) => setForm({ ...form, desc: e.target.value })} />
        </FormModal>
      )}
    </div>
  );
}


export default IncantesimiTab;
