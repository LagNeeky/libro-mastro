import React, { useState } from 'react';
import { styles } from '../styles.js';
import { uid, RARITA_OPTIONS } from '../utils/helpers.js';
import { AutoTextarea, LinkButton, LinkPicker } from './shared.jsx';
import { newOggettoNarrativo } from '../data/oggettoNarrativo.js';

const TIPI_OGGETTO = ["Arma", "Armatura", "Accessorio", "Reliquia", "Altro"];

function OggettiNarrativiTab({ oggetti, setOggetti, luoghi, mostri, apriEntitaId, apriEntita }) {
  const [attivoId, setAttivoId] = useState(oggetti[0]?.id || null);
  const [query, setQuery] = useState("");

  React.useEffect(() => {
    if (apriEntitaId?.tipo === "oggetto_narrativo" && apriEntitaId.id && oggetti.some((o) => o.id === apriEntitaId.id)) setAttivoId(apriEntitaId.id);
  }, [apriEntitaId, oggetti]);

  const attivo = oggetti.find((o) => o.id === attivoId) || oggetti[0];

  const aggiungiOggetto = () => {
    const nuovo = { ...newOggettoNarrativo(), id: uid() };
    setOggetti([...oggetti, nuovo]);
    setAttivoId(nuovo.id);
  };
  const rimuoviOggetto = (id) => {
    const nuovi = oggetti.filter((o) => o.id !== id);
    setOggetti(nuovi);
    if (attivoId === id) setAttivoId(nuovi[0]?.id || null);
  };
  const updateAttivo = (patch) => setOggetti(oggetti.map((o) => (o.id === attivo.id ? { ...o, ...patch } : o)));

  if (!attivo) {
    return (
      <div style={styles.panel}>
        <h2 style={styles.panelTitle}>Oggetti Narrativi</h2>
        <p style={styles.hint}>Oggetti magici, reliquie e artefatti con una storia da raccontare — chi li ha creati, dove sono, chi li possiede ora. Nessun oggetto creato ancora.</p>
        <button style={styles.primaryBtn} onClick={aggiungiOggetto}>+ Nuovo Oggetto</button>
      </div>
    );
  }

  const elenco = oggetti.filter((o) => o.nome.toLowerCase().includes(query.toLowerCase()));

  return (
    <div style={styles.panel}>
      <h2 style={styles.panelTitle}>Oggetti Narrativi</h2>
      <p style={styles.hint}>Un database di oggetti magici, reliquie e artefatti con una storia, distinto dal catalogo Armi/Armature/Accessori dei giocatori: qui conta il retroscena, non le meccaniche di gioco pure.</p>

      <div style={styles.pgSelectorRow}>
        <input style={styles.searchInput} placeholder="Cerca un oggetto..." value={query} onChange={(e) => setQuery(e.target.value)} />
        <select style={styles.pgSelect} value={attivo.id} onChange={(e) => setAttivoId(e.target.value)}>
          {elenco.map((o) => <option key={o.id} value={o.id}>{o.nome} ({o.rarita})</option>)}
        </select>
        <button style={styles.newPgBtn} onClick={aggiungiOggetto}>+ Nuovo</button>
        <button style={{ ...styles.pgDelBtn, marginLeft: "auto" }} onClick={() => rimuoviOggetto(attivo.id)}>✕</button>
      </div>

      <div style={{ ...styles.sectionDivider, marginTop: 16, marginBottom: 16 }} />

      <div style={{ ...styles.invTable, marginBottom: 14 }}>
        <div style={styles.invRow}>
          <input style={{ ...styles.invNome, flex: 1, fontWeight: 700, fontSize: 16 }} value={attivo.nome} onChange={(e) => updateAttivo({ nome: e.target.value })} />
          <select style={{ ...styles.invPos, flex: 1 }} value={attivo.tipo} onChange={(e) => updateAttivo({ tipo: e.target.value })}>
            {TIPI_OGGETTO.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div style={styles.invRow}>
          <select style={styles.invNome} value={attivo.rarita} onChange={(e) => updateAttivo({ rarita: e.target.value })}>
            {RARITA_OPTIONS.map((r) => <option key={r.id} value={r.nome}>{r.nome}</option>)}
          </select>
          <div style={styles.invPos} />
        </div>
      </div>

      <div style={styles.invRow}>
        <div style={styles.invNome}>Posseduto da (PNG)</div>
        <LinkPicker elenco={mostri} value={attivo.proprietarioId} onChange={(id) => updateAttivo({ proprietarioId: id, luogoId: id ? null : attivo.luogoId })} placeholder="Nessuno" />
        {attivo.proprietarioId && <LinkButton tipo="creatura" id={attivo.proprietarioId} elenco={mostri} apriEntita={apriEntita} />}
        <div style={styles.invSpacer} />
      </div>
      {!attivo.proprietarioId && (
        <div style={styles.invRow}>
          <div style={styles.invNome}>Si trova a (Luogo)</div>
          <LinkPicker elenco={luoghi} value={attivo.luogoId} onChange={(id) => updateAttivo({ luogoId: id })} placeholder="Nessuno" />
          {attivo.luogoId && <LinkButton tipo="luogo" id={attivo.luogoId} elenco={luoghi} apriEntita={apriEntita} />}
          <div style={styles.invSpacer} />
        </div>
      )}

      <div style={styles.sectionLabel}>Statistiche di Gioco</div>
      <AutoTextarea style={{ ...styles.notes, minHeight: 70 }} value={attivo.statistiche} onChange={(e) => updateAttivo({ statistiche: e.target.value })} placeholder="Bonus, proprietà magiche, effetti attivabili..." />

      <div style={styles.sectionLabel}>Descrizione</div>
      <AutoTextarea style={{ ...styles.notes, minHeight: 70 }} value={attivo.descrizione} onChange={(e) => updateAttivo({ descrizione: e.target.value })} placeholder="Aspetto fisico dell'oggetto..." />

      <div style={styles.sectionLabel}>Retroscena</div>
      <AutoTextarea style={{ ...styles.notes, minHeight: 90 }} value={attivo.retroscena} onChange={(e) => updateAttivo({ retroscena: e.target.value })} placeholder="Chi lo ha creato, perché, che storia ha attraversato prima di arrivare qui..." />

      <div style={styles.sectionLabel}>Note del Master</div>
      <AutoTextarea style={{ ...styles.notes, minHeight: 70 }} value={attivo.note} onChange={(e) => updateAttivo({ note: e.target.value })} />
    </div>
  );
}

export default OggettiNarrativiTab;
