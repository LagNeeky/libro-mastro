import React, { useState } from 'react';
import { styles, palette } from '../styles.js';
import { uid, fmt } from '../utils/helpers.js';
import { NumInput } from './shared.jsx';

const CONDIZIONI_STANDARD = [
  "Accecato", "Affascinato", "Afferrato", "Assordato", "Atterrito", "Avvelenato",
  "Incapacitato", "Incatenato", "Invisibile", "Immobilizzato", "Prono", "Stordito", "Paralizzato", "Pietrificato", "Morente",
];

function TrackerTurniTab({ personaggi, mostri, tracker, setTracker, openDiceRoll }) {
  const [nomeRapido, setNomeRapido] = useState("");
  const [iniziativaRapida, setIniziativaRapida] = useState(10);

  const combattenti = tracker.combattenti || [];
  const round = tracker.round || 1;
  const turnoAttivoId = tracker.turnoAttivoId || null;

  const aggiornaTracker = (patch) => setTracker({ ...tracker, ...patch });
  const aggiornaCombattente = (id, patch) => aggiornaTracker({ combattenti: combattenti.map((c) => (c.id === id ? { ...c, ...patch } : c)) });
  const rimuoviCombattente = (id) => aggiornaTracker({ combattenti: combattenti.filter((c) => c.id !== id) });

  const aggiungiDaRoster = (fonte, obj) => {
    const nuovo = {
      id: uid(),
      nome: obj.nome,
      fonte, // "pg" | "mostro" | "manuale"
      fonteId: obj.id || null,
      iniziativa: 10,
      pfMax: obj.pfMax ?? obj.pfMassimi ?? 0,
      pfAttuali: obj.pfAttuali ?? obj.pfMassimi ?? 0,
      ca: obj.ca ?? "",
      condizioni: [],
      note: "",
    };
    aggiornaTracker({ combattenti: [...combattenti, nuovo] });
  };

  const aggiungiRapido = () => {
    if (!nomeRapido.trim()) return;
    aggiornaTracker({
      combattenti: [...combattenti, { id: uid(), nome: nomeRapido, fonte: "manuale", fonteId: null, iniziativa: Number(iniziativaRapida) || 0, pfMax: 0, pfAttuali: 0, ca: "", condizioni: [], note: "" }],
    });
    setNomeRapido("");
  };

  const ordinaPerIniziativa = () => {
    const ordinati = [...combattenti].sort((a, b) => Number(b.iniziativa) - Number(a.iniziativa));
    aggiornaTracker({ combattenti: ordinati, turnoAttivoId: ordinati[0]?.id || null, round: 1 });
  };

  const combattentiOrdinati = [...combattenti].sort((a, b) => Number(b.iniziativa) - Number(a.iniziativa));

  const prossimoTurno = () => {
    if (!combattentiOrdinati.length) return;
    const idx = combattentiOrdinati.findIndex((c) => c.id === turnoAttivoId);
    if (idx === -1 || idx === combattentiOrdinati.length - 1) {
      aggiornaTracker({ turnoAttivoId: combattentiOrdinati[0].id, round: round + 1 });
    } else {
      aggiornaTracker({ turnoAttivoId: combattentiOrdinati[idx + 1].id });
    }
  };
  const turnoPrecedente = () => {
    if (!combattentiOrdinati.length) return;
    const idx = combattentiOrdinati.findIndex((c) => c.id === turnoAttivoId);
    if (idx <= 0) {
      aggiornaTracker({ turnoAttivoId: combattentiOrdinati[combattentiOrdinati.length - 1].id, round: Math.max(1, round - 1) });
    } else {
      aggiornaTracker({ turnoAttivoId: combattentiOrdinati[idx - 1].id });
    }
  };

  const toggleCondizione = (c, cond) => {
    const has = c.condizioni.includes(cond);
    aggiornaCombattente(c.id, { condizioni: has ? c.condizioni.filter((x) => x !== cond) : [...c.condizioni, cond] });
  };

  const applicaDanno = (c, valore) => {
    const n = Number(valore);
    if (isNaN(n)) return;
    aggiornaCombattente(c.id, { pfAttuali: Math.max(0, Math.min(c.pfMax || 9999, c.pfAttuali - n)) });
  };

  const resetCombattimento = () => {
    if (!window.confirm) { aggiornaTracker({ combattenti: [], round: 1, turnoAttivoId: null }); return; }
    aggiornaTracker({ combattenti: [], round: 1, turnoAttivoId: null });
  };

  return (
    <div style={styles.panel}>
      <h2 style={styles.panelTitle}>Tracker dei Turni</h2>
      <p style={styles.hint}>Aggiungi combattenti dai Personaggi o dalle Schede Mostri/PNG, oppure al volo con nome e iniziativa. Ordina, avanza i turni, e tieni traccia di PF e condizioni durante lo scontro.</p>

      <div style={styles.roundBar}>
        <div style={styles.roundLabel}>Round {round}</div>
        <button style={styles.smallBtn} onClick={turnoPrecedente}>◀ Turno Precedente</button>
        <button style={styles.primaryBtn} onClick={prossimoTurno}>Turno Successivo ▶</button>
        <button style={styles.smallBtn} onClick={ordinaPerIniziativa}>🔄 Riordina per Iniziativa</button>
        <button style={styles.smallDangerBtn} onClick={resetCombattimento}>Azzera Combattimento</button>
      </div>

      <div style={styles.columnTitleLeft}>Aggiungi Combattenti</div>
      <div style={styles.pgSelectorRow}>
        <select style={styles.pgSelect} defaultValue="" onChange={(e) => { const pg = personaggi.find((p) => p.id === e.target.value); if (pg) aggiungiDaRoster("pg", pg); e.target.value = ""; }}>
          <option value="" disabled>+ Da Personaggio Giocante...</option>
          {personaggi.map((p) => <option key={p.id} value={p.id}>{p.nome}</option>)}
        </select>
        <select style={styles.pgSelect} defaultValue="" onChange={(e) => { const m = mostri.find((x) => x.id === e.target.value); if (m) aggiungiDaRoster("mostro", m); e.target.value = ""; }}>
          <option value="" disabled>+ Da Scheda Mostro/PNG...</option>
          {mostri.map((m) => <option key={m.id} value={m.id}>{m.nome}</option>)}
        </select>
      </div>
      <div style={styles.pgSelectorRow}>
        <input style={styles.overrideInput} placeholder="Nome rapido" value={nomeRapido} onChange={(e) => setNomeRapido(e.target.value)} />
        <label style={styles.modLabel}>Iniziativa<NumInput min={-10} max={40} style={styles.modInput} value={iniziativaRapida} onCommit={setIniziativaRapida} /></label>
        <button style={styles.smallBtn} onClick={aggiungiRapido}>+ Aggiungi al Volo</button>
      </div>

      <div style={styles.sectionDivider} />

      {combattentiOrdinati.length === 0 ? (
        <p style={styles.hint}>Nessun combattente ancora. Aggiungine uno con i controlli sopra.</p>
      ) : (
        combattentiOrdinati.map((c) => {
          const attivo = c.id === turnoAttivoId;
          const morente = c.pfMax > 0 && c.pfAttuali <= 0;
          return (
            <div key={c.id} style={{ ...styles.itemGroup, ...(attivo ? styles.combattenteAttivo : {}) }}>
              <div style={styles.itemRow}>
                {attivo && <span style={styles.turnoIndicatore} title="Turno attuale">▶</span>}
                <input style={{ ...styles.overrideInput, flex: 1, fontWeight: 700, ...(morente ? { color: palette.dangerRed } : {}) }} value={c.nome} onChange={(e) => aggiornaCombattente(c.id, { nome: e.target.value })} />
                <label style={styles.modLabel}>Iniz.<NumInput min={-10} max={40} style={styles.modInput} value={c.iniziativa} onCommit={(n) => aggiornaCombattente(c.id, { iniziativa: n })} /></label>
                <label style={styles.modLabel}>CA<input style={styles.modInput} value={c.ca} onChange={(e) => aggiornaCombattente(c.id, { ca: e.target.value })} /></label>
                <label style={styles.modLabel}>PF Max<NumInput min={0} max={9999} style={styles.modInput} value={c.pfMax} onCommit={(n) => aggiornaCombattente(c.id, { pfMax: n })} /></label>
                <label style={styles.modLabel}>PF Att.<NumInput min={0} max={9999} style={styles.modInput} value={c.pfAttuali} onCommit={(n) => aggiornaCombattente(c.id, { pfAttuali: n })} /></label>
                <input style={{ ...styles.overrideInput, width: 70 }} placeholder="±danno" onKeyDown={(e) => { if (e.key === "Enter") { applicaDanno(c, e.target.value); e.target.value = ""; } }} />
                <button style={styles.removeX} onClick={() => rimuoviCombattente(c.id)}>✕</button>
              </div>
              <div style={styles.condizioniRow}>
                {CONDIZIONI_STANDARD.map((cond) => (
                  <button key={cond} style={{ ...styles.condizioneChip, ...(c.condizioni.includes(cond) ? styles.condizioneChipAttiva : {}) }} onClick={() => toggleCondizione(c, cond)}>{cond}</button>
                ))}
              </div>
              <input style={styles.itemNoteInput} placeholder="Note rapide (es. concentrazione su Immobilizzare Persone)..." value={c.note} onChange={(e) => aggiornaCombattente(c.id, { note: e.target.value })} />
            </div>
          );
        })
      )}
    </div>
  );
}

export default TrackerTurniTab;
