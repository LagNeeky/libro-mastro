import React, { useState } from 'react';
import { styles } from '../styles.js';
import { ABILITIES, ABILITY_LABELS, uid, RARITA_OPTIONS } from '../utils/helpers.js';
import { FormModal } from './shared.jsx';

function EquipTab({ classi, armi, setArmi, armature, setArmature, accessori, setAccessori, openDetail, pg, updatePg }) {
  const [query, setQuery] = useState("");
  const [showWForm, setShowWForm] = useState(false); const [showAForm, setShowAForm] = useState(false); const [showAccForm, setShowAccForm] = useState(false);
  const [wForm, setWForm] = useState({ nome: "", categoria: "mischia", danno: "", tipoDanno: "", finesse: false, note: "", rarita: "Comune", classi: [] });
  const [aForm, setAForm] = useState({ nome: "", ca: 11, tipo: "leggera", maxDex: "", rarita: "Comune", classi: [] });
  const [accForm, setAccForm] = useState({ nome: "", desc: "", rarita: "Comune" });

  const q = query.toLowerCase();
  const [filtroClasse, setFiltroClasse] = useState("");
  const [filtroRarita, setFiltroRarita] = useState("");
  const passaClasse = (item) => !filtroClasse || !item.classi || item.classi.length === 0 || item.classi.includes(filtroClasse);
  const passaRarita = (item) => !filtroRarita || (item.rarita || "Comune") === filtroRarita;
  const armiF = armi.filter((w) => w.nome.toLowerCase().includes(q)).filter(passaClasse).filter(passaRarita);
  const armatureF = armature.filter((a) => a.nome.toLowerCase().includes(q)).filter(passaClasse).filter(passaRarita);
  const accessoriF = accessori.filter((a) => a.nome.toLowerCase().includes(q)).filter(passaRarita);

  const nomiClassi = (ids) => (ids && ids.length ? ids.map((cid) => (classi.find((c) => c.id === cid) || {}).nome).filter(Boolean).join(", ") : "Tutte le classi");

  const toggleClasseWForm = (id) => setWForm((f) => ({ ...f, classi: f.classi.includes(id) ? f.classi.filter((x) => x !== id) : [...f.classi, id] }));
  const toggleClasseAForm = (id) => setAForm((f) => ({ ...f, classi: f.classi.includes(id) ? f.classi.filter((x) => x !== id) : [...f.classi, id] }));

  const salvaArma = () => { if (!wForm.nome.trim()) return; setArmi((s) => [...s, { ...wForm, id: uid(), custom: true }]); setWForm({ nome: "", categoria: "mischia", danno: "", tipoDanno: "", finesse: false, note: "", rarita: "Comune", classi: [] }); setShowWForm(false); };
  const salvaArmatura = () => { if (!aForm.nome.trim()) return; setArmature((s) => [...s, { id: uid(), nome: aForm.nome, ca: Number(aForm.ca), tipo: aForm.tipo, maxDex: aForm.maxDex === "" ? null : Number(aForm.maxDex), forzaMin: null, rarita: aForm.rarita, classi: aForm.classi, custom: true }]); setAForm({ nome: "", ca: 11, tipo: "leggera", maxDex: "", rarita: "Comune", classi: [] }); setShowAForm(false); };
  const salvaAccessorio = () => { if (!accForm.nome.trim()) return; setAccessori((s) => [...s, { id: uid(), nome: accForm.nome, desc: accForm.desc, rarita: accForm.rarita, custom: true }]); setAccForm({ nome: "", desc: "", rarita: "Comune" }); setShowAccForm(false); };
  const isOnPg = (kind, refId) => { if (kind === "arma") return pg.armiPossedute.some((x) => x.refId === refId); if (kind === "armatura") return pg.armaturePossedute.some((x) => x.refId === refId); return pg.accessoriPosseduti.some((x) => x.refId === refId); };
  const addToPg = (kind, refId) => {
    if (isOnPg(kind, refId)) {
      if (kind === "arma") updatePg({ armiPossedute: pg.armiPossedute.filter((x) => x.refId !== refId) });
      if (kind === "armatura") { const rimossa = pg.armaturePossedute.find((x) => x.refId === refId); updatePg({ armaturePossedute: pg.armaturePossedute.filter((x) => x.refId !== refId), armaturaIndossataInstId: rimossa && pg.armaturaIndossataInstId === rimossa.instId ? null : pg.armaturaIndossataInstId }); }
      if (kind === "accessorio") updatePg({ accessoriPosseduti: pg.accessoriPosseduti.filter((x) => x.refId !== refId) });
      return;
    }
    if (kind === "arma") updatePg({ armiPossedute: [...pg.armiPossedute, { instId: uid(), refId, magico: "", rarita: "" }] });
    if (kind === "armatura") updatePg({ armaturePossedute: [...pg.armaturePossedute, { instId: uid(), refId, magico: "", rarita: "" }] });
    if (kind === "accessorio") updatePg({ accessoriPosseduti: [...pg.accessoriPosseduti, { instId: uid(), refId, magico: "", rarita: "" }] });
  };

  return (
    <div style={styles.panel}>
      <input style={styles.searchInput} value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Cerca in armi, armature e accessori..." />
      <div style={styles.formRow}>
        <select style={styles.formInput} value={filtroClasse} onChange={(e) => setFiltroClasse(e.target.value)}>
          <option value="">Tutte le classi (armi/armature)</option>
          {classi.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
        </select>
        <select style={styles.formInput} value={filtroRarita} onChange={(e) => setFiltroRarita(e.target.value)}>
          <option value="">Tutte le rarità</option>
          {RARITA_OPTIONS.map((r) => <option key={r.id} value={r.nome}>{r.nome}</option>)}
        </select>
        {(filtroClasse || filtroRarita) && <button style={styles.smallBtn} onClick={() => { setFiltroClasse(""); setFiltroRarita(""); }}>✕ Azzera filtri</button>}
      </div>
      <div style={styles.hint}>Il filtro per classe si applica solo ad armi e armature (gli accessori sono utilizzabili da tutti).</div>

      <div style={styles.equipHeadRow}><h2 style={styles.panelTitle}>Armi</h2><button style={styles.primaryBtn} onClick={() => setShowWForm(true)}>+ Nuovo</button></div>
      <div style={styles.cardGrid}>
        {armiF.map((w) => (
          <div key={w.id} style={styles.dataCard}>
            <button style={styles.dataCardTitleBtn} onClick={() => openDetail({ type: "arma", data: w })}>{w.nome}{w.custom ? " ★" : ""}</button>
            <div style={styles.dataCardBody}>{w.danno} {w.tipoDanno}<br /><span style={styles.hint}>{w.note}</span></div>
            <div style={styles.hint}>Rarità: {w.rarita || "Comune"} · Classi: {nomiClassi(w.classi)}</div>
            <div style={styles.cardBtnRow}><button style={{ ...styles.smallBtn, ...(isOnPg("arma", w.id) ? styles.smallBtnActive : {}) }} onClick={() => addToPg("arma", w.id)}>{isOnPg("arma", w.id) ? "✓ Sulla scheda (rimuovi)" : `+ Aggiungi a ${pg.nome || "scheda"}`}</button>{w.custom && <button style={styles.smallDangerBtn} onClick={() => setArmi((s) => s.filter((x) => x.id !== w.id))}>Rimuovi dalla libreria</button>}</div>
          </div>
        ))}
      </div>

      <div style={styles.equipHeadRow}><h2 style={styles.panelTitle}>Armature</h2><button style={styles.primaryBtn} onClick={() => setShowAForm(true)}>+ Nuovo</button></div>
      <div style={styles.cardGrid}>
        {armatureF.map((a) => (
          <div key={a.id} style={styles.dataCard}>
            <button style={styles.dataCardTitleBtn} onClick={() => openDetail({ type: "armatura", data: a })}>{a.nome}{a.custom ? " ★" : ""}</button>
            <div style={styles.dataCardBody}>CA base {a.ca} · {a.tipo}<br /><span style={styles.hint}>{a.maxDex === null ? "Bonus DES illimitato" : `Bonus DES max +${a.maxDex}`}{a.forzaMin ? ` · Richiede FOR ${a.forzaMin}` : ""}</span></div>
            <div style={styles.hint}>Rarità: {a.rarita || "Comune"} · Classi: {nomiClassi(a.classi)}</div>
            <div style={styles.cardBtnRow}><button style={{ ...styles.smallBtn, ...(isOnPg("armatura", a.id) ? styles.smallBtnActive : {}) }} onClick={() => addToPg("armatura", a.id)}>{isOnPg("armatura", a.id) ? "✓ Sulla scheda (rimuovi)" : `+ Aggiungi a ${pg.nome || "scheda"}`}</button>{a.custom && <button style={styles.smallDangerBtn} onClick={() => setArmature((s) => s.filter((x) => x.id !== a.id))}>Rimuovi dalla libreria</button>}</div>
          </div>
        ))}
      </div>

      <div style={styles.equipHeadRow}><h2 style={styles.panelTitle}>Accessori</h2><button style={styles.primaryBtn} onClick={() => setShowAccForm(true)}>+ Nuovo</button></div>
      <div style={styles.cardGrid}>
        {accessoriF.map((a) => (
          <div key={a.id} style={styles.dataCard}>
            <button style={styles.dataCardTitleBtn} onClick={() => openDetail({ type: "accessorio", data: a })}>{a.nome}{a.custom ? " ★" : ""}</button>
            <div style={styles.dataCardBody}>{a.desc}</div>
            <div style={styles.hint}>Rarità: {a.rarita || "Comune"} · Utilizzabile da tutte le classi</div>
            <div style={styles.cardBtnRow}><button style={{ ...styles.smallBtn, ...(isOnPg("accessorio", a.id) ? styles.smallBtnActive : {}) }} onClick={() => addToPg("accessorio", a.id)}>{isOnPg("accessorio", a.id) ? "✓ Sulla scheda (rimuovi)" : `+ Aggiungi a ${pg.nome || "scheda"}`}</button>{a.custom && <button style={styles.smallDangerBtn} onClick={() => setAccessori((s) => s.filter((x) => x.id !== a.id))}>Rimuovi dalla libreria</button>}</div>
          </div>
        ))}
      </div>

      {showWForm && (
        <FormModal title="Nuova arma" onClose={() => setShowWForm(false)} onSubmit={salvaArma} canSubmit={!!wForm.nome.trim()}>
          <input style={{ ...styles.formInput, display: "block", width: "100%", marginBottom: 8 }} placeholder="Nome" value={wForm.nome} onChange={(e) => setWForm({ ...wForm, nome: e.target.value })} />
          <div style={styles.formRow}>
            <select style={styles.formInput} value={wForm.categoria} onChange={(e) => setWForm({ ...wForm, categoria: e.target.value })}><option value="mischia">Mischia</option><option value="distanza">Distanza</option></select>
            <input style={styles.formInput} placeholder="Danno (es. 1d8)" value={wForm.danno} onChange={(e) => setWForm({ ...wForm, danno: e.target.value })} />
            <input style={styles.formInput} placeholder="Tipo danno" value={wForm.tipoDanno} onChange={(e) => setWForm({ ...wForm, tipoDanno: e.target.value })} />
          </div>
          <div style={styles.formRow}>
            <label style={styles.checkField}><input type="checkbox" checked={wForm.finesse} onChange={(e) => setWForm({ ...wForm, finesse: e.target.checked })} />Finesse</label>
            <input style={styles.formInput} placeholder="Altre proprietà" value={wForm.note} onChange={(e) => setWForm({ ...wForm, note: e.target.value })} />
            <select style={styles.formInput} value={wForm.rarita} onChange={(e) => setWForm({ ...wForm, rarita: e.target.value })}>{RARITA_OPTIONS.map((r) => <option key={r.id} value={r.nome}>{r.nome}</option>)}</select>
          </div>
          <div style={styles.hint}>Classi che possono usarla (nessuna selezionata = tutte):</div>
          <div style={styles.chipRow}>{classi.map((c) => <button key={c.id} onClick={() => toggleClasseWForm(c.id)} style={{ ...styles.chip, ...(wForm.classi.includes(c.id) ? styles.chipActive : {}) }}>{c.nome}</button>)}</div>
        </FormModal>
      )}
      {showAForm && (
        <FormModal title="Nuova armatura" onClose={() => setShowAForm(false)} onSubmit={salvaArmatura} canSubmit={!!aForm.nome.trim()}>
          <input style={{ ...styles.formInput, display: "block", width: "100%", marginBottom: 8 }} placeholder="Nome" value={aForm.nome} onChange={(e) => setAForm({ ...aForm, nome: e.target.value })} />
          <div style={styles.formRow}>
            <input type="number" style={{ ...styles.formInput, width: 90 }} placeholder="CA base" value={aForm.ca} onChange={(e) => setAForm({ ...aForm, ca: e.target.value })} />
            <select style={styles.formInput} value={aForm.tipo} onChange={(e) => setAForm({ ...aForm, tipo: e.target.value })}><option value="leggera">Leggera</option><option value="media">Media</option><option value="pesante">Pesante</option></select>
            <input type="number" style={{ ...styles.formInput, width: 150 }} placeholder="Max bonus DES (vuoto=illimitato)" value={aForm.maxDex} onChange={(e) => setAForm({ ...aForm, maxDex: e.target.value })} />
          </div>
          <div style={styles.formRow}>
            <select style={styles.formInput} value={aForm.rarita} onChange={(e) => setAForm({ ...aForm, rarita: e.target.value })}>{RARITA_OPTIONS.map((r) => <option key={r.id} value={r.nome}>{r.nome}</option>)}</select>
          </div>
          <div style={styles.hint}>Classi che possono indossarla (nessuna selezionata = tutte):</div>
          <div style={styles.chipRow}>{classi.map((c) => <button key={c.id} onClick={() => toggleClasseAForm(c.id)} style={{ ...styles.chip, ...(aForm.classi.includes(c.id) ? styles.chipActive : {}) }}>{c.nome}</button>)}</div>
        </FormModal>
      )}
      {showAccForm && (
        <FormModal title="Nuovo accessorio" onClose={() => setShowAccForm(false)} onSubmit={salvaAccessorio} canSubmit={!!accForm.nome.trim()}>
          <input style={{ ...styles.formInput, display: "block", width: "100%", marginBottom: 8 }} placeholder="Nome" value={accForm.nome} onChange={(e) => setAccForm({ ...accForm, nome: e.target.value })} />
          <select style={{ ...styles.formInput, marginBottom: 8 }} value={accForm.rarita} onChange={(e) => setAccForm({ ...accForm, rarita: e.target.value })}>{RARITA_OPTIONS.map((r) => <option key={r.id} value={r.nome}>{r.nome}</option>)}</select>
          <textarea style={styles.formTextarea} placeholder="Descrizione ed effetto" value={accForm.desc} onChange={(e) => setAccForm({ ...accForm, desc: e.target.value })} />
        </FormModal>
      )}
    </div>
  );
}


export default EquipTab;
