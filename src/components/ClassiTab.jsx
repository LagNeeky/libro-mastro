import React, { useState, useRef } from 'react';
import { styles } from '../styles.js';
import { ABILITIES, ABILITY_LABELS, PROGRESSIONE_LABELS, uid, parseTratti } from '../utils/helpers.js';
import { FormModal } from './shared.jsx';
import ExportSelectModal from './ExportSelectModal.jsx';
import { leggiFileImportati, smistaEImporta } from '../utils/importExport.js';

function trattiToText(tratti) {
  return (tratti || []).map((t) => (t.desc ? `${t.nome}: ${t.desc}` : t.nome)).join("\n");
}

function ClassiTab({ classi, setClassi, sottoclassi, setSottoclassi, openDetail }) {
  const [showCForm, setShowCForm] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const importInputRef = useRef(null);
  const [importMsg, setImportMsg] = useState("");

  const gestisciImport = async (e) => {
    const files = e.target.files;
    if (!files || !files.length) return;
    const risultati = await leggiFileImportati(files);
    const { importati, tipiIgnorati } = smistaEImporta(risultati, { classe: setClassi, sottoclasse: setSottoclassi }, uid);
    setImportMsg(`Importati ${importati} elementi.${tipiIgnorati.length ? ` Ignorati alcuni file di tipo non compatibile con questa pagina: ${tipiIgnorati.join(", ")}.` : ""}`);
    e.target.value = "";
  };
  const [showScForm, setShowScForm] = useState(null);
  const [modificaCId, setModificaCId] = useState(null);
  const [modificaScId, setModificaScId] = useState(null);
  const [cForm, setCForm] = useState({ nome: "", dado: 8, tiri: [], caster: "", progressione: "nessuno", tratti: "" });
  const [scForm, setScForm] = useState({ nome: "", tratti: "" });
  const [query, setQuery] = useState("");
  const [filtroProgressione, setFiltroProgressione] = useState("");

  const toggleTiroForm = (ab) => setCForm((f) => ({ ...f, tiri: f.tiri.includes(ab) ? f.tiri.filter((x) => x !== ab) : [...f.tiri, ab] }));

  const apriNuovaClasse = () => { setModificaCId(null); setCForm({ nome: "", dado: 8, tiri: [], caster: "", progressione: "nessuno", tratti: "" }); setShowCForm(true); };
  const apriModificaClasse = (c) => { setModificaCId(c.id); setCForm({ nome: c.nome, dado: c.dado, tiri: [...(c.tiri || [])], caster: c.caster || "", progressione: c.progressione || "nessuno", tratti: trattiToText(c.tratti) }); setShowCForm(true); };
  const apriNuovaSottoclasse = (classeId) => { setModificaScId(null); setScForm({ nome: "", tratti: "" }); setShowScForm(classeId); };
  const apriModificaSottoclasse = (s) => { setModificaScId(s.id); setScForm({ nome: s.nome, tratti: trattiToText(s.tratti) }); setShowScForm(s.classeId); };

  const salvaClasse = () => {
    if (!cForm.nome.trim()) return;
    const patch = { nome: cForm.nome, dado: Number(cForm.dado), tiri: cForm.tiri, caster: cForm.caster || null, progressione: cForm.caster ? cForm.progressione : "nessuno", tratti: parseTratti(cForm.tratti), custom: true };
    if (modificaCId) setClassi((s) => s.map((c) => (c.id === modificaCId ? { ...c, ...patch } : c)));
    else setClassi((s) => [...s, { id: uid(), ...patch }]);
    setCForm({ nome: "", dado: 8, tiri: [], caster: "", progressione: "nessuno", tratti: "" });
    setModificaCId(null);
    setShowCForm(false);
  };
  const salvaSottoclasse = (classeId) => {
    if (!scForm.nome.trim()) return;
    if (modificaScId) setSottoclassi((s) => s.map((x) => (x.id === modificaScId ? { ...x, nome: scForm.nome, tratti: parseTratti(scForm.tratti), custom: true } : x)));
    else setSottoclassi((s) => [...s, { id: uid(), classeId, nome: scForm.nome, tratti: parseTratti(scForm.tratti), custom: true }]);
    setScForm({ nome: "", tratti: "" });
    setModificaScId(null);
    setShowScForm(null);
  };

  const q = query.toLowerCase();
  const classiF = classi
    .filter((c) => c.nome.toLowerCase().includes(q) || sottoclassi.some((s) => s.classeId === c.id && s.nome.toLowerCase().includes(q)))
    .filter((c) => !filtroProgressione || (c.progressione || "nessuno") === filtroProgressione);

  return (
    <div style={styles.panel}>
      <h2 style={styles.panelTitle}>Classi</h2>
      <input style={styles.searchInput} value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Cerca una classe o sottoclasse..." />
      <div style={styles.chipRow}>
        <button onClick={() => setFiltroProgressione("")} style={{ ...styles.chip, ...(filtroProgressione === "" ? styles.chipActive : {}) }}>Tutte</button>
        {Object.keys(PROGRESSIONE_LABELS).map((p) => <button key={p} onClick={() => setFiltroProgressione(p)} style={{ ...styles.chip, ...(filtroProgressione === p ? styles.chipActive : {}) }}>{PROGRESSIONE_LABELS[p]}</button>)}
      </div>
      <button style={{ ...styles.primaryBtn, marginBottom: 10 }} onClick={apriNuovaClasse}>+ Nuova classe</button>
      <div style={styles.pgSelectorRow}>
        <button style={styles.smallBtn} onClick={() => setShowExport(true)}>⬇ Esporta</button>
        <button style={styles.smallBtn} onClick={() => importInputRef.current?.click()}>⬆ Importa</button>
        <input ref={importInputRef} type="file" accept=".json,.zip" multiple style={{ display: "none" }} onChange={gestisciImport} />
      </div>
      {importMsg && <div style={styles.hint}>{importMsg}</div>}
      {showExport && (
        <ExportSelectModal
          nomeZip="classi_libro_mastro"
          onClose={() => setShowExport(false)}
          gruppi={[
            { tipo: "classe", etichetta: "Classi", elementi: classi },
            { tipo: "sottoclasse", etichetta: "Sottoclassi", elementi: sottoclassi },
          ]}
        />
      )}
      <div style={{ ...styles.cardGrid, marginTop: 14 }}>
        {classiF.map((c) => (
          <div key={c.id} style={styles.dataCard}>
            <button style={styles.dataCardTitleBtn} onClick={() => openDetail({ type: "classe", data: c })}>{c.nome}{c.custom ? " ★" : ""}</button>
            <div style={styles.hint}>Dado vita d{c.dado} · {c.caster ? `${PROGRESSIONE_LABELS[c.progressione || "pieno"]} (${ABILITY_LABELS[c.caster]})` : PROGRESSIONE_LABELS.nessuno}</div>
            <div style={styles.cardBtnRow}>
              <button style={styles.smallBtn} onClick={() => apriNuovaSottoclasse(c.id)}>+ Sottoclasse</button>
              <button style={styles.smallBtn} onClick={() => apriModificaClasse(c)}>✏️ Modifica</button>
              {c.custom && <button style={styles.smallDangerBtn} onClick={() => setClassi((s) => s.filter((x) => x.id !== c.id))}>Rimuovi</button>}
            </div>
            {sottoclassi.filter((s) => s.classeId === c.id).length > 0 && (
              <div style={{ marginTop: 8 }}>
                {sottoclassi.filter((s) => s.classeId === c.id).map((s) => (
                  <div key={s.id} style={styles.subRow}>
                    <button style={styles.itemName} onClick={() => openDetail({ type: "sottoclasse", data: s })}>{s.nome}{s.custom ? " ★" : ""}</button>
                    <button style={styles.smallBtn} onClick={() => apriModificaSottoclasse(s)}>✏️</button>
                    {s.custom && <button style={styles.pgDelBtn} onClick={() => setSottoclassi((x) => x.filter((y) => y.id !== s.id))}>✕</button>}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {showCForm && (
        <FormModal title={modificaCId ? "Modifica classe" : "Nuova classe homebrew"} onClose={() => setShowCForm(false)} onSubmit={salvaClasse} canSubmit={!!cForm.nome.trim()}>
          <input style={{ ...styles.formInput, display: "block", width: "100%", marginBottom: 8 }} placeholder="Nome classe" value={cForm.nome} onChange={(e) => setCForm({ ...cForm, nome: e.target.value })} />
          <div style={styles.formRow}>
            <select style={styles.formInput} value={cForm.dado} onChange={(e) => setCForm({ ...cForm, dado: e.target.value })}>{[6, 8, 10, 12].map((d) => <option key={d} value={d}>d{d}</option>)}</select>
            <select style={styles.formInput} value={cForm.caster} onChange={(e) => setCForm({ ...cForm, caster: e.target.value })}>
              <option value="">Non incantatore</option>{ABILITIES.map((a) => <option key={a} value={a}>Incantatore ({ABILITY_LABELS[a]})</option>)}
            </select>
          </div>
          {cForm.caster && (
            <div style={styles.formRow}>
              <div style={styles.hint}>Progressione:</div>
              <div style={styles.chipRow}>
                <button onClick={() => setCForm({ ...cForm, progressione: "mezzo" })} style={{ ...styles.chip, ...(cForm.progressione === "mezzo" ? styles.chipActive : {}) }}>Mezzo incantatore</button>
                <button onClick={() => setCForm({ ...cForm, progressione: "pieno" })} style={{ ...styles.chip, ...(cForm.progressione === "pieno" ? styles.chipActive : {}) }}>Incantatore completo</button>
              </div>
            </div>
          )}
          <div style={styles.hint}>Tiri salvezza competenti:</div>
          <div style={styles.chipRow}>{ABILITIES.map((a) => <button key={a} onClick={() => toggleTiroForm(a)} style={{ ...styles.chip, ...(cForm.tiri.includes(a) ? styles.chipActive : {}) }}>{ABILITY_LABELS[a]}</button>)}</div>
          <textarea style={styles.formTextarea} placeholder={"Tratti, uno per riga (formato Nome: descrizione)"} value={cForm.tratti} onChange={(e) => setCForm({ ...cForm, tratti: e.target.value })} />
        </FormModal>
      )}
      {showScForm && (
        <FormModal title={modificaScId ? "Modifica sottoclasse" : "Nuova sottoclasse homebrew"} onClose={() => setShowScForm(null)} onSubmit={() => salvaSottoclasse(showScForm)} canSubmit={!!scForm.nome.trim()}>
          <input style={{ ...styles.formInput, display: "block", width: "100%", marginBottom: 8 }} placeholder="Nome sottoclasse" value={scForm.nome} onChange={(e) => setScForm({ ...scForm, nome: e.target.value })} />
          <textarea style={styles.formTextarea} placeholder={"Tratti, uno per riga (formato Nome: descrizione)"} value={scForm.tratti} onChange={(e) => setScForm({ ...scForm, tratti: e.target.value })} />
        </FormModal>
      )}
    </div>
  );
}


export default ClassiTab;
