import React, { useState, useRef, useEffect } from 'react';
import { styles } from '../styles.js';
import { uid } from '../utils/helpers.js';


const NOTE_COLORS = ["#ece2c8", "#c8992f", "#c2452f", "#4c8c4a", "#5aa9d6"];

function NoteEditor({ note, onChangeHtml }) {
  const ref = useRef(null);
  useEffect(() => {
    if (ref.current && ref.current.innerHTML !== (note.html || "")) ref.current.innerHTML = note.html || "";
  }, [note.id]);
  const exec = (cmd, val) => { document.execCommand(cmd, false, val); if (ref.current) onChangeHtml(ref.current.innerHTML); };
  return (
    <div>
      <div style={styles.noteToolbar}>
        <button style={styles.noteToolBtn} onClick={() => exec("bold")}><strong>G</strong></button>
        <button style={styles.noteToolBtn} onClick={() => exec("underline")}><u>S</u></button>
        {NOTE_COLORS.map((c) => <button key={c} style={{ ...styles.noteColorBtn, background: c }} onClick={() => exec("foreColor", c)} title="Colore testo" />)}
        <button style={styles.noteToolBtn} onClick={() => exec("removeFormat")}>✕ Formato</button>
      </div>
      <div ref={ref} contentEditable suppressContentEditableWarning style={styles.noteEditorBox} onInput={(e) => onChangeHtml(e.currentTarget.innerHTML)} />
    </div>
  );
}

function AppuntiTab({ appunti, setAppunti }) {
  const [attivoId, setAttivoId] = useState(appunti[0]?.id || null);
  const nota = appunti.find((n) => n.id === attivoId);

  const aggiungiAppunto = () => { const n = { id: uid(), titolo: "Nuovo appunto", html: "" }; setAppunti((a) => [...a, n]); setAttivoId(n.id); };
  const rimuoviAppunto = (id) => { setAppunti((a) => a.filter((x) => x.id !== id)); if (attivoId === id) setAttivoId(null); };
  const aggiornaAppunto = (id, patch) => setAppunti((a) => a.map((x) => (x.id === id ? { ...x, ...patch } : x)));

  return (
    <div style={styles.schedeLayout}>
      <aside style={styles.sidebar}>
        <div style={styles.sidebarTitle}>I tuoi appunti</div>
        {appunti.map((n) => (
          <div key={n.id} style={{ ...styles.pgListItem, ...(n.id === attivoId ? styles.pgListItemActive : {}) }}>
            <button style={styles.pgListBtn} onClick={() => setAttivoId(n.id)}><span style={styles.pgListName}>{n.titolo || "Senza titolo"}</span></button>
            <button style={styles.pgDelBtn} onClick={() => rimuoviAppunto(n.id)}>✕</button>
          </div>
        ))}
        <button style={styles.primaryBtn} onClick={aggiungiAppunto}>+ Nuovo appunto</button>
      </aside>
      <section style={styles.sheet}>
        {nota ? (
          <>
            <input style={styles.nameInput} value={nota.titolo} onChange={(e) => aggiornaAppunto(nota.id, { titolo: e.target.value })} placeholder="Titolo dell'appunto" />
            <div style={{ marginTop: 16 }}>
              <NoteEditor note={nota} onChangeHtml={(html) => aggiornaAppunto(nota.id, { html })} />
            </div>
          </>
        ) : (
          <div style={styles.hint}>Seleziona un appunto dalla lista o creane uno nuovo per iniziare a scrivere. Puoi usare grassetto, sottolineato e colori dalla barra degli strumenti.</div>
        )}
      </section>
    </div>
  );
}


export default AppuntiTab;
