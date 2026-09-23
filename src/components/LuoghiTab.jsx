import React, { useState } from 'react';
import { styles } from '../styles.js';
import { uid } from '../utils/helpers.js';
import { AutoTextarea, LinkButton, LinkPicker } from './shared.jsx';
import { newLuogo } from '../data/luogo.js';

const TIPI_LUOGO = ["Continente", "Regione", "Città", "Villaggio", "Taverna", "Dungeon", "Altro"];

function LuoghiTab({ luoghi, setLuoghi, fazioni, mostri, apriEntitaId, apriEntita }) {
  const [attivoId, setAttivoId] = useState(luoghi[0]?.id || null);
  const [query, setQuery] = useState("");

  React.useEffect(() => {
    if (apriEntitaId?.tipo === "luogo" && apriEntitaId.id && luoghi.some((l) => l.id === apriEntitaId.id)) setAttivoId(apriEntitaId.id);
  }, [apriEntitaId, luoghi]);

  const attivo = luoghi.find((l) => l.id === attivoId) || luoghi[0];

  const aggiungiLuogo = () => {
    const nuovo = { ...newLuogo(), id: uid() };
    setLuoghi([...luoghi, nuovo]);
    setAttivoId(nuovo.id);
  };
  const rimuoviLuogo = (id) => {
    const nuovi = luoghi.filter((l) => l.id !== id).map((l) => (l.luogoPadreId === id ? { ...l, luogoPadreId: null } : l));
    setLuoghi(nuovi);
    if (attivoId === id) setAttivoId(nuovi[0]?.id || null);
  };
  const updateAttivo = (patch) => setLuoghi(luoghi.map((l) => (l.id === attivo.id ? { ...l, ...patch } : l)));

  if (!attivo) {
    return (
      <div style={styles.panel}>
        <h2 style={styles.panelTitle}>Luoghi</h2>
        <p style={styles.hint}>Continenti, regioni, città, villaggi, taverne, dungeon — il tuo mondo, organizzato in gerarchia. Nessun luogo creato ancora.</p>
        <button style={styles.primaryBtn} onClick={aggiungiLuogo}>+ Nuovo Luogo</button>
      </div>
    );
  }

  const elenco = luoghi.filter((l) => l.nome.toLowerCase().includes(query.toLowerCase()));
  const luoghiFigli = luoghi.filter((l) => l.luogoPadreId === attivo.id);
  const pngQui = mostri.filter((m) => m.luogoId === attivo.id);
  const opzioniLuogoPadre = luoghi.filter((l) => l.id !== attivo.id);

  return (
    <div style={styles.panel}>
      <h2 style={styles.panelTitle}>Luoghi</h2>
      <p style={styles.hint}>Mappa il tuo mondo: continenti, regioni, città, taverne o dungeon. Ogni luogo può appartenere a un luogo più grande, ed elenca automaticamente i PNG che vi si trovano.</p>

      <div style={styles.pgSelectorRow}>
        <input style={styles.searchInput} placeholder="Cerca un luogo..." value={query} onChange={(e) => setQuery(e.target.value)} />
        <select style={styles.pgSelect} value={attivo.id} onChange={(e) => setAttivoId(e.target.value)}>
          {elenco.map((l) => <option key={l.id} value={l.id}>{l.nome} ({l.tipo})</option>)}
        </select>
        <button style={styles.newPgBtn} onClick={aggiungiLuogo}>+ Nuovo</button>
        <button style={{ ...styles.pgDelBtn, marginLeft: "auto" }} onClick={() => rimuoviLuogo(attivo.id)}>✕</button>
      </div>

      <div style={{ ...styles.sectionDivider, marginTop: 16, marginBottom: 16 }} />

      <div style={{ ...styles.invTable, marginBottom: 14 }}>
        <div style={styles.invRow}>
          <input style={{ ...styles.invNome, flex: 1, fontWeight: 700, fontSize: 16 }} value={attivo.nome} onChange={(e) => updateAttivo({ nome: e.target.value })} />
          <select style={{ ...styles.invPos, flex: 1 }} value={attivo.tipo} onChange={(e) => updateAttivo({ tipo: e.target.value })}>
            {TIPI_LUOGO.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
      </div>

      <div style={styles.invRow}>
        <div style={styles.invNome}>Luogo Genitore</div>
        <LinkPicker elenco={opzioniLuogoPadre} value={attivo.luogoPadreId} onChange={(id) => updateAttivo({ luogoPadreId: id })} placeholder="Nessuno (luogo di primo livello)" />
        <div style={styles.invSpacer} />
      </div>
      <div style={styles.invRow}>
        <div style={styles.invNome}>Fazione Controllante</div>
        <LinkPicker elenco={fazioni} value={attivo.fazioneControllanteId} onChange={(id) => updateAttivo({ fazioneControllanteId: id })} placeholder="Nessuna" />
        <div style={styles.invSpacer} />
      </div>

      <div style={styles.sectionLabel}>Descrizione</div>
      <AutoTextarea style={{ ...styles.notes, minHeight: 100 }} value={attivo.descrizione} onChange={(e) => updateAttivo({ descrizione: e.target.value })} placeholder="Aspetto, atmosfera, storia del luogo..." />

      <div style={styles.sectionLabel}>Agganci di Trama</div>
      <AutoTextarea style={{ ...styles.notes, minHeight: 80 }} value={attivo.agganciTrama} onChange={(e) => updateAttivo({ agganciTrama: e.target.value })} placeholder="Cosa potrebbe succedere qui, segreti nascosti, motivi per cui i giocatori potrebbero tornarci..." />

      {luoghiFigli.length > 0 && (
        <>
          <div style={styles.columnTitleLeft}>Luoghi al suo interno</div>
          <div style={styles.condizioniRow}>
            {luoghiFigli.map((l) => <LinkButton key={l.id} tipo="luogo" id={l.id} elenco={luoghi} apriEntita={apriEntita} />)}
          </div>
        </>
      )}

      <div style={styles.columnTitleLeft}>PNG presenti qui</div>
      {pngQui.length > 0 ? (
        <div style={styles.condizioniRow}>
          {pngQui.map((m) => <LinkButton key={m.id} tipo="creatura" id={m.id} elenco={mostri} apriEntita={apriEntita} />)}
        </div>
      ) : (
        <p style={styles.hint}>Nessun PNG collegato a questo luogo. Per collegarne uno, apri la sua Scheda Mostro/PNG e imposta questo luogo come "Si trova a".</p>
      )}

      <div style={styles.sectionLabel}>Note del Master</div>
      <AutoTextarea style={{ ...styles.notes, minHeight: 80 }} value={attivo.note} onChange={(e) => updateAttivo({ note: e.target.value })} />
    </div>
  );
}

export default LuoghiTab;
