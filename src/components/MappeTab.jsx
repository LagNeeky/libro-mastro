import React, { useState, useRef } from 'react';
import { styles } from '../styles.js';
import { uid } from '../utils/helpers.js';


const ICONE_MARCATORE = { mostro: "👹", struttura: "🏰", alleato: "🛡️", mercante: "💰", importante: "⭐" };
const LABEL_MARCATORE = { mostro: "Mostro", struttura: "Struttura", alleato: "Alleato", mercante: "Mercante", importante: "Luogo importante" };

function MapViewerModal({ mappa, onClose, onUpdateMarcatori }) {
  const [zoom, setZoom] = useState(1);
  const [modalitaAggiunta, setModalitaAggiunta] = useState(false);
  const [tipoSelezionato, setTipoSelezionato] = useState("importante");
  const [editingId, setEditingId] = useState(null);
  const [editNome, setEditNome] = useState("");
  const [editTipo, setEditTipo] = useState("importante");

  const handleContainerClick = (e) => {
    if (!modalitaAggiunta) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    const nuovo = { id: uid(), x, y, tipo: tipoSelezionato, nome: "Nuovo marcatore" };
    onUpdateMarcatori([...mappa.marcatori, nuovo]);
    setEditingId(nuovo.id); setEditNome(nuovo.nome); setEditTipo(nuovo.tipo);
  };
  const apriModificaMarcatore = (m, e) => { e.stopPropagation(); setEditingId(m.id); setEditNome(m.nome); setEditTipo(m.tipo); };
  const salvaModificaMarcatore = () => { onUpdateMarcatori(mappa.marcatori.map((m) => (m.id === editingId ? { ...m, nome: editNome, tipo: editTipo } : m))); setEditingId(null); };
  const rimuoviMarcatore = () => { onUpdateMarcatori(mappa.marcatori.filter((m) => m.id !== editingId)); setEditingId(null); };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modalBoxWide} onClick={(e) => e.stopPropagation()}>
        <button style={styles.modalClose} onClick={onClose}>✕</button>
        <h3 style={styles.modalTitle}>{mappa.titolo}</h3>
        <div style={styles.mapToolbar}>
          <button style={styles.smallBtn} onClick={() => setZoom((z) => Math.max(0.5, z - 0.25))}>− Zoom</button>
          <span style={styles.hint}>{Math.round(zoom * 100)}%</span>
          <button style={styles.smallBtn} onClick={() => setZoom((z) => Math.min(3, z + 0.25))}>+ Zoom</button>
          <button style={styles.smallBtn} onClick={() => setZoom(1)}>Reset</button>
          <button style={{ ...styles.smallBtn, ...(modalitaAggiunta ? styles.smallBtnActive : {}) }} onClick={() => setModalitaAggiunta((v) => !v)}>📍 {modalitaAggiunta ? "Aggiunta attiva" : "Aggiungi marcatore"}</button>
        </div>
        {modalitaAggiunta && (
          <div style={styles.chipRow}>
            {Object.keys(ICONE_MARCATORE).map((t) => (
              <button key={t} onClick={() => setTipoSelezionato(t)} style={{ ...styles.chip, ...(tipoSelezionato === t ? styles.chipActive : {}) }}>{ICONE_MARCATORE[t]} {LABEL_MARCATORE[t]}</button>
            ))}
            <span style={styles.hint}>Clicca sulla mappa per piazzare il marcatore.</span>
          </div>
        )}
        <div style={{ ...styles.mapContainer, cursor: modalitaAggiunta ? "crosshair" : "default" }}>
          <div style={{ ...styles.mapInner, transform: `scale(${zoom})` }} onClick={handleContainerClick}>
            <img src={mappa.url} alt={mappa.titolo} style={styles.mapImg} draggable={false} />
            {mappa.marcatori.map((m) => (
              <div key={m.id} title={m.nome} style={{ ...styles.mapMarker, left: `${m.x}%`, top: `${m.y}%` }} onClick={(e) => apriModificaMarcatore(m, e)}>{ICONE_MARCATORE[m.tipo]}</div>
            ))}
          </div>
        </div>
        {editingId && (
          <div style={styles.markerEditPanel}>
            <input style={styles.formInput} value={editNome} onChange={(e) => setEditNome(e.target.value)} placeholder="Nome marcatore" />
            <select style={styles.formInput} value={editTipo} onChange={(e) => setEditTipo(e.target.value)}>
              {Object.keys(ICONE_MARCATORE).map((t) => <option key={t} value={t}>{ICONE_MARCATORE[t]} {LABEL_MARCATORE[t]}</option>)}
            </select>
            <button style={styles.smallBtn} onClick={salvaModificaMarcatore}>Salva</button>
            <button style={styles.smallDangerBtn} onClick={rimuoviMarcatore}>Rimuovi</button>
          </div>
        )}
      </div>
    </div>
  );
}

function MappeTab({ mappe, setMappe }) {
  const fileInputRef = useRef(null);
  const [viewingId, setViewingId] = useState(null);
  const [ignorati, setIgnorati] = useState(0);
  const mappaAperta = mappe.find((m) => m.id === viewingId);

  const handleFiles = (e) => {
    const files = Array.from(e.target.files || []);
    let skip = 0;
    files.forEach((file) => {
      if (!file.name.toLowerCase().startsWith("map_")) { skip++; return; }
      const titolo = file.name.slice(4).replace(/\.[^.]+$/, "").replace(/[_-]+/g, " ").trim() || file.name;
      const reader = new FileReader();
      reader.onload = () => setMappe((m) => [...m, { id: uid(), titolo, url: String(reader.result), marcatori: [] }]);
      reader.readAsDataURL(file);
    });
    setIgnorati(skip);
    e.target.value = "";
  };
  const rimuovi = (id) => setMappe((m) => m.filter((x) => x.id !== id));
  const aggiornaMarcatori = (id, marcatori) => setMappe((m) => m.map((x) => (x.id === id ? { ...x, marcatori } : x)));

  const rinomina = (id, titolo) => setMappe((m) => m.map((x) => (x.id === id ? { ...x, titolo } : x)));

  return (
    <div style={styles.panel}>
      <h2 style={styles.panelTitle}>Mappe</h2>
      <p style={styles.hint}>Carica immagini con nome che inizia per "map_" (es. "map_Taverna del Drago.png"): verranno riconosciute automaticamente come mappe, con il resto del nome come titolo. Apri una mappa per zoomare e piazzare marcatori.</p>
      <input ref={fileInputRef} type="file" accept="image/*" multiple style={{ display: "none" }} onChange={handleFiles} />
      <button style={styles.primaryBtn} onClick={() => fileInputRef.current?.click()}>+ Carica mappe</button>
      {ignorati > 0 && <div style={{ ...styles.hint, marginTop: 6 }}>{ignorati} file ignorati: il nome deve iniziare per "map_".</div>}
      {mappe.length === 0 && <div style={{ ...styles.hint, marginTop: 12 }}>Nessuna mappa caricata.</div>}
      <div style={{ ...styles.cardGrid, marginTop: 14 }}>
        {mappe.map((m) => (
          <div key={m.id} style={styles.dataCard}>
            <img src={m.url} alt={m.titolo} style={styles.mapThumb} onClick={() => setViewingId(m.id)} />
            <input style={styles.mapTitleInput} value={m.titolo} onChange={(e) => rinomina(m.id, e.target.value)} placeholder="Nome mappa" />
            <div style={styles.hint}>{m.marcatori.length} marcatori</div>
            <div style={styles.cardBtnRow}>
              <button style={styles.smallBtn} onClick={() => setViewingId(m.id)}>Apri</button>
              <button style={styles.smallDangerBtn} onClick={() => rimuovi(m.id)}>Rimuovi</button>
            </div>
          </div>
        ))}
      </div>
      {mappaAperta && <MapViewerModal mappa={mappaAperta} onClose={() => setViewingId(null)} onUpdateMarcatori={(marcatori) => aggiornaMarcatori(mappaAperta.id, marcatori)} />}
    </div>
  );
}


export default MappeTab;
