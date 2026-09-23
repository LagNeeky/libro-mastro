import React, { useState } from 'react';
import { styles } from '../styles.js';
import { uid } from '../utils/helpers.js';
import { AutoTextarea, LinkButton, LinkPicker } from './shared.jsx';
import { newMissione, STATI_MISSIONE } from '../data/missione.js';

function MissioniTab({ missioni, setMissioni, luoghi, fazioni, mostri, apriEntitaId, apriEntita }) {
  const [attivoId, setAttivoId] = useState(missioni[0]?.id || null);
  const [query, setQuery] = useState("");
  const [filtroStato, setFiltroStato] = useState("");

  React.useEffect(() => {
    if (apriEntitaId?.tipo === "missione" && apriEntitaId.id && missioni.some((m) => m.id === apriEntitaId.id)) setAttivoId(apriEntitaId.id);
  }, [apriEntitaId, missioni]);

  const attivo = missioni.find((m) => m.id === attivoId) || missioni[0];

  const aggiungiMissione = () => {
    const nuova = { ...newMissione(), id: uid() };
    setMissioni([...missioni, nuova]);
    setAttivoId(nuova.id);
  };
  const rimuoviMissione = (id) => {
    const nuove = missioni.filter((m) => m.id !== id);
    setMissioni(nuove);
    if (attivoId === id) setAttivoId(nuove[0]?.id || null);
  };
  const updateAttivo = (patch) => setMissioni(missioni.map((m) => (m.id === attivo.id ? { ...m, ...patch } : m)));

  if (!attivo) {
    return (
      <div style={styles.panel}>
        <h2 style={styles.panelTitle}>Missioni</h2>
        <p style={styles.hint}>Trama principale e missioni secondarie, con obiettivi, ricompense e stato di avanzamento. Nessuna missione creata ancora.</p>
        <button style={styles.primaryBtn} onClick={aggiungiMissione}>+ Nuova Missione</button>
      </div>
    );
  }

  const elenco = missioni
    .filter((m) => m.nome.toLowerCase().includes(query.toLowerCase()))
    .filter((m) => !filtroStato || m.stato === filtroStato);

  return (
    <div style={styles.panel}>
      <h2 style={styles.panelTitle}>Missioni</h2>
      <p style={styles.hint}>Organizza la trama principale e le missioni secondarie: obiettivi, ricompense, e stato di avanzamento sempre a colpo d'occhio.</p>

      <div style={styles.pgSelectorRow}>
        <input style={styles.searchInput} placeholder="Cerca una missione..." value={query} onChange={(e) => setQuery(e.target.value)} />
        <select style={styles.pgSelect} value={filtroStato} onChange={(e) => setFiltroStato(e.target.value)}>
          <option value="">Tutti gli stati</option>
          {STATI_MISSIONE.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>
      <div style={styles.pgSelectorRow}>
        <select style={styles.pgSelect} value={attivo.id} onChange={(e) => setAttivoId(e.target.value)}>
          {elenco.map((m) => <option key={m.id} value={m.id}>{m.principale ? "★ " : ""}{m.nome} — {m.stato}</option>)}
        </select>
        <button style={styles.newPgBtn} onClick={aggiungiMissione}>+ Nuova</button>
        <button style={{ ...styles.pgDelBtn, marginLeft: "auto" }} onClick={() => rimuoviMissione(attivo.id)}>✕</button>
      </div>

      <div style={{ ...styles.sectionDivider, marginTop: 16, marginBottom: 16 }} />

      <div style={{ ...styles.invTable, marginBottom: 14 }}>
        <div style={styles.invRow}>
          <input style={{ ...styles.invNome, flex: 1, fontWeight: 700, fontSize: 16 }} value={attivo.nome} onChange={(e) => updateAttivo({ nome: e.target.value })} />
          <select style={{ ...styles.invPos, flex: 1 }} value={attivo.stato} onChange={(e) => updateAttivo({ stato: e.target.value })}>
            {STATI_MISSIONE.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div style={styles.invRow}>
          <label style={styles.checkField}><input type="checkbox" checked={attivo.principale} onChange={(e) => updateAttivo({ principale: e.target.checked })} /> Fa parte della trama principale</label>
        </div>
      </div>

      <div style={styles.invRow}>
        <div style={styles.invNome}>Luogo collegato</div>
        <LinkPicker elenco={luoghi} value={attivo.luogoId} onChange={(id) => updateAttivo({ luogoId: id })} placeholder="Nessuno" />
        {attivo.luogoId && <LinkButton tipo="luogo" id={attivo.luogoId} elenco={luoghi} apriEntita={apriEntita} />}
        <div style={styles.invSpacer} />
      </div>
      <div style={styles.invRow}>
        <div style={styles.invNome}>Fazione collegata</div>
        <LinkPicker elenco={fazioni} value={attivo.fazioneId} onChange={(id) => updateAttivo({ fazioneId: id })} placeholder="Nessuna" />
        {attivo.fazioneId && <LinkButton tipo="fazione" id={attivo.fazioneId} elenco={fazioni} apriEntita={apriEntita} />}
        <div style={styles.invSpacer} />
      </div>
      <div style={styles.invRow}>
        <div style={styles.invNome}>PNG collegato</div>
        <LinkPicker elenco={mostri} value={attivo.pngCollegatoId} onChange={(id) => updateAttivo({ pngCollegatoId: id })} placeholder="Nessuno" />
        {attivo.pngCollegatoId && <LinkButton tipo="creatura" id={attivo.pngCollegatoId} elenco={mostri} apriEntita={apriEntita} />}
        <div style={styles.invSpacer} />
      </div>

      <div style={styles.sectionLabel}>Descrizione</div>
      <AutoTextarea style={{ ...styles.notes, minHeight: 80 }} value={attivo.descrizione} onChange={(e) => updateAttivo({ descrizione: e.target.value })} placeholder="Come inizia questa missione, cosa la scatena..." />

      <div style={styles.sectionLabel}>Obiettivi</div>
      <AutoTextarea style={{ ...styles.notes, minHeight: 70 }} value={attivo.obiettivi} onChange={(e) => updateAttivo({ obiettivi: e.target.value })} placeholder="Cosa devono fare i giocatori per completarla..." />

      <div style={styles.sectionLabel}>Ricompense</div>
      <AutoTextarea style={{ ...styles.notes, minHeight: 60 }} value={attivo.ricompense} onChange={(e) => updateAttivo({ ricompense: e.target.value })} placeholder="Oro, oggetti, informazioni, favori..." />

      <div style={styles.sectionLabel}>Note del Master</div>
      <AutoTextarea style={{ ...styles.notes, minHeight: 70 }} value={attivo.note} onChange={(e) => updateAttivo({ note: e.target.value })} />
    </div>
  );
}

export default MissioniTab;
