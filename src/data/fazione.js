import React, { useState } from 'react';
import { styles } from '../styles.js';
import { uid } from '../utils/helpers.js';
import { AutoTextarea, LinkButton, LinkPicker, LinkMultiPicker } from './shared.jsx';
import { newFazione } from '../data/fazione.js';

const TIPI_FAZIONE = ["Gilda", "Culto", "Regno", "Ordine Cavalleresco", "Altro"];

function FazioniTab({ fazioni, setFazioni, luoghi, mostri, apriEntitaId, apriEntita }) {
  const [attivoId, setAttivoId] = useState(fazioni[0]?.id || null);
  const [query, setQuery] = useState("");

  React.useEffect(() => {
    if (apriEntitaId?.tipo === "fazione" && apriEntitaId.id && fazioni.some((f) => f.id === apriEntitaId.id)) setAttivoId(apriEntitaId.id);
  }, [apriEntitaId, fazioni]);

  const attivo = fazioni.find((f) => f.id === attivoId) || fazioni[0];

  const aggiungiFazione = () => {
    const nuova = { ...newFazione(), id: uid() };
    setFazioni([...fazioni, nuova]);
    setAttivoId(nuova.id);
  };
  const rimuoviFazione = (id) => {
    const nuove = fazioni.filter((f) => f.id !== id).map((f) => ({ ...f, alleati: f.alleati.filter((a) => a !== id), nemici: f.nemici.filter((n) => n !== id) }));
    setFazioni(nuove);
    if (attivoId === id) setAttivoId(nuove[0]?.id || null);
  };
  const updateAttivo = (patch) => setFazioni(fazioni.map((f) => (f.id === attivo.id ? { ...f, ...patch } : f)));

  if (!attivo) {
    return (
      <div style={styles.panel}>
        <h2 style={styles.panelTitle}>Fazioni & Organizzazioni</h2>
        <p style={styles.hint}>Gilde, culti, regni, ordini cavallereschi — chi muove i fili del tuo mondo. Nessuna fazione creata ancora.</p>
        <button style={styles.primaryBtn} onClick={aggiungiFazione}>+ Nuova Fazione</button>
      </div>
    );
  }

  const elenco = fazioni.filter((f) => f.nome.toLowerCase().includes(query.toLowerCase()));
  const altreFazioni = fazioni.filter((f) => f.id !== attivo.id);
  const membri = mostri.filter((m) => m.fazioneId === attivo.id);
  const luoghiControllati = luoghi.filter((l) => l.fazioneControllanteId === attivo.id);

  return (
    <div style={styles.panel}>
      <h2 style={styles.panelTitle}>Fazioni & Organizzazioni</h2>
      <p style={styles.hint}>Traccia obiettivi, risorse, alleati e nemici di ogni gruppo organizzato del tuo mondo. Membri e luoghi controllati vengono mostrati automaticamente, collegandoli dalle rispettive schede.</p>

      <div style={styles.pgSelectorRow}>
        <input style={styles.searchInput} placeholder="Cerca una fazione..." value={query} onChange={(e) => setQuery(e.target.value)} />
        <select style={styles.pgSelect} value={attivo.id} onChange={(e) => setAttivoId(e.target.value)}>
          {elenco.map((f) => <option key={f.id} value={f.id}>{f.nome} ({f.tipo})</option>)}
        </select>
        <button style={styles.newPgBtn} onClick={aggiungiFazione}>+ Nuova</button>
        <button style={{ ...styles.pgDelBtn, marginLeft: "auto" }} onClick={() => rimuoviFazione(attivo.id)}>✕</button>
      </div>

      <div style={{ ...styles.sectionDivider, marginTop: 16, marginBottom: 16 }} />

      <div style={{ ...styles.invTable, marginBottom: 14 }}>
        <div style={styles.invRow}>
          <input style={{ ...styles.invNome, flex: 1, fontWeight: 700, fontSize: 16 }} value={attivo.nome} onChange={(e) => updateAttivo({ nome: e.target.value })} />
          <select style={{ ...styles.invPos, flex: 1 }} value={attivo.tipo} onChange={(e) => updateAttivo({ tipo: e.target.value })}>
            {TIPI_FAZIONE.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div style={styles.invRow}>
          <input style={styles.invNome} placeholder="Allineamento / moralità" value={attivo.allineamento} onChange={(e) => updateAttivo({ allineamento: e.target.value })} />
          <div style={styles.invPos}>
            <LinkPicker elenco={luoghi} value={attivo.luogoBaseId} onChange={(id) => updateAttivo({ luogoBaseId: id })} placeholder="Base operativa: nessuna" />
          </div>
        </div>
      </div>
      {attivo.luogoBaseId && <div style={{ marginBottom: 10 }}><LinkButton tipo="luogo" id={attivo.luogoBaseId} elenco={luoghi} apriEntita={apriEntita} /></div>}

      <div style={styles.sectionLabel}>Descrizione</div>
      <AutoTextarea style={{ ...styles.notes, minHeight: 80 }} value={attivo.descrizione} onChange={(e) => updateAttivo({ descrizione: e.target.value })} placeholder="Chi sono, come si presentano, come agiscono..." />

      <div style={styles.sectionLabel}>Obiettivi</div>
      <AutoTextarea style={{ ...styles.notes, minHeight: 70 }} value={attivo.obiettivi} onChange={(e) => updateAttivo({ obiettivi: e.target.value })} placeholder="Cosa vogliono ottenere, a breve e lungo termine..." />

      <div style={styles.sectionLabel}>Risorse</div>
      <AutoTextarea style={{ ...styles.notes, minHeight: 70 }} value={attivo.risorse} onChange={(e) => updateAttivo({ risorse: e.target.value })} placeholder="Ricchezza, uomini, magia, influenza politica..." />

      <div style={styles.columnTitleLeft}>Alleati</div>
      <LinkMultiPicker elenco={altreFazioni} valori={attivo.alleati} onChange={(v) => updateAttivo({ alleati: v })} placeholder="Cerca una fazione alleata..." />

      <div style={{ ...styles.columnTitleLeft, marginTop: 14 }}>Nemici</div>
      <LinkMultiPicker elenco={altreFazioni} valori={attivo.nemici} onChange={(v) => updateAttivo({ nemici: v })} placeholder="Cerca una fazione nemica..." />

      <div style={{ ...styles.columnTitleLeft, marginTop: 14 }}>Membri</div>
      {membri.length > 0 ? (
        <div style={styles.condizioniRow}>{membri.map((m) => <LinkButton key={m.id} tipo="creatura" id={m.id} elenco={mostri} apriEntita={apriEntita} />)}</div>
      ) : (
        <p style={styles.hint}>Nessun PNG collegato. Apri una Scheda Mostro/PNG e imposta questa fazione come sua appartenenza.</p>
      )}

      <div style={{ ...styles.columnTitleLeft, marginTop: 14 }}>Luoghi controllati</div>
      {luoghiControllati.length > 0 ? (
        <div style={styles.condizioniRow}>{luoghiControllati.map((l) => <LinkButton key={l.id} tipo="luogo" id={l.id} elenco={luoghi} apriEntita={apriEntita} />)}</div>
      ) : (
        <p style={styles.hint}>Nessun luogo collegato. Apri un Luogo e imposta questa fazione come controllante.</p>
      )}

      <div style={styles.sectionLabel}>Note del Master</div>
      <AutoTextarea style={{ ...styles.notes, minHeight: 80 }} value={attivo.note} onChange={(e) => updateAttivo({ note: e.target.value })} />
    </div>
  );
}

export default FazioniTab;
