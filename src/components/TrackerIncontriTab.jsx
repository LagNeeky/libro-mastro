import React, { useState } from 'react';
import { styles } from '../styles.js';
import { uid } from '../utils/helpers.js';
import { GS_PUNTI_ESPERIENZA } from '../data/creatura.js';
import { SOGLIE_PE_PER_LIVELLO, moltiplicatorePerNumeroMostri } from '../data/incontri.js';
import { NumInput } from './shared.jsx';

function TrackerIncontriTab({ mostri }) {
  const [giocatori, setGiocatori] = useState([]);
  const [mostriScelti, setMostriScelti] = useState([]); // { id, mostroId o gsManuale, nome, quantita }

  const aggiungiGiocatore = () => setGiocatori([...giocatori, { id: uid(), livello: 1 }]);
  const rimuoviGiocatore = (id) => setGiocatori(giocatori.filter((g) => g.id !== id));
  const aggiornaGiocatore = (id, livello) => setGiocatori(giocatori.map((g) => (g.id === id ? { ...g, livello } : g)));

  const aggiungiMostroDaRoster = (m) => setMostriScelti([...mostriScelti, { id: uid(), mostroId: m.id, nome: m.nome, gs: m.gs, quantita: 1 }]);
  const aggiungiMostroManuale = () => setMostriScelti([...mostriScelti, { id: uid(), mostroId: null, nome: "Mostro generico", gs: "1", quantita: 1 }]);
  const aggiornaMostroScelto = (id, patch) => setMostriScelti(mostriScelti.map((m) => (m.id === id ? { ...m, ...patch } : m)));
  const rimuoviMostroScelto = (id) => setMostriScelti(mostriScelti.filter((m) => m.id !== id));

  const numeroGiocatori = giocatori.length;
  const soglieGruppo = giocatori.reduce(
    (acc, g) => {
      const s = SOGLIE_PE_PER_LIVELLO[Math.min(20, Math.max(1, Number(g.livello) || 1))];
      acc.facile += s.facile; acc.media += s.media; acc.difficile += s.difficile; acc.mortale += s.mortale;
      return acc;
    },
    { facile: 0, media: 0, difficile: 0, mortale: 0 }
  );

  const numeroMostriTotale = mostriScelti.reduce((s, m) => s + (Number(m.quantita) || 0), 0);
  const peBase = mostriScelti.reduce((s, m) => s + (GS_PUNTI_ESPERIENZA[m.gs] ?? 0) * (Number(m.quantita) || 0), 0);
  const moltiplicatore = moltiplicatorePerNumeroMostri(numeroMostriTotale, numeroGiocatori);
  const peAdeguato = Math.round(peBase * moltiplicatore);

  let difficolta = "Nessuna sfida";
  let coloreDifficolta = styles.hint;
  if (numeroMostriTotale > 0) {
    if (peAdeguato >= soglieGruppo.mortale) { difficolta = "Mortale"; coloreDifficolta = styles.difficoltaMortale; }
    else if (peAdeguato >= soglieGruppo.difficile) { difficolta = "Difficile"; coloreDifficolta = styles.difficoltaDifficile; }
    else if (peAdeguato >= soglieGruppo.media) { difficolta = "Media"; coloreDifficolta = styles.difficoltaMedia; }
    else if (peAdeguato >= soglieGruppo.facile) { difficolta = "Facile"; coloreDifficolta = styles.difficoltaFacile; }
    else { difficolta = "Banale"; coloreDifficolta = styles.hint; }
  }

  return (
    <div style={styles.panel}>
      <h2 style={styles.panelTitle}>Tracker Incontri</h2>
      <p style={styles.hint}>Calcola la difficoltà di uno scontro secondo la regola ufficiale dei Punti Esperienza adeguati, in base al livello del gruppo e al numero di mostri coinvolti.</p>

      <div style={styles.columnTitleLeft}>Gruppo di Giocatori</div>
      <div style={styles.pgSelectorRow}>
        {giocatori.map((g) => (
          <label key={g.id} style={styles.modLabel}>
            Livello
            <NumInput min={1} max={20} style={styles.modInput} value={g.livello} onCommit={(n) => aggiornaGiocatore(g.id, n)} />
            <button style={styles.removeX} onClick={() => rimuoviGiocatore(g.id)}>✕</button>
          </label>
        ))}
        <button style={styles.smallBtn} onClick={aggiungiGiocatore}>+ Aggiungi Giocatore</button>
      </div>
      <div style={styles.hint}>Soglie del gruppo ({numeroGiocatori} giocatori): Facile {soglieGruppo.facile} · Media {soglieGruppo.media} · Difficile {soglieGruppo.difficile} · Mortale {soglieGruppo.mortale} PE</div>

      <div style={styles.sectionDivider} />

      <div style={styles.columnTitleLeft}>Mostri nello Scontro</div>
      <div style={styles.pgSelectorRow}>
        <select style={styles.pgSelect} defaultValue="" onChange={(e) => { const m = mostri.find((x) => x.id === e.target.value); if (m) aggiungiMostroDaRoster(m); e.target.value = ""; }}>
          <option value="" disabled>+ Da Scheda Mostro/PNG...</option>
          {mostri.map((m) => <option key={m.id} value={m.id}>{m.nome} (GS {m.gs})</option>)}
        </select>
        <button style={styles.smallBtn} onClick={aggiungiMostroManuale}>+ Mostro Manuale</button>
      </div>
      {mostriScelti.map((m) => (
        <div key={m.id} style={styles.itemRow}>
          <input style={{ ...styles.overrideInput, flex: 1 }} value={m.nome} onChange={(e) => aggiornaMostroScelto(m.id, { nome: e.target.value })} disabled={!!m.mostroId} />
          <label style={styles.modLabel}>GS
            <select style={styles.modInput} value={m.gs} onChange={(e) => aggiornaMostroScelto(m.id, { gs: e.target.value })} disabled={!!m.mostroId}>
              {Object.keys(GS_PUNTI_ESPERIENZA).map((g) => <option key={g} value={g}>{g}</option>)}
            </select>
          </label>
          <label style={styles.modLabel}>Quantità
            <NumInput min={1} max={99} style={styles.modInput} value={m.quantita} onCommit={(n) => aggiornaMostroScelto(m.id, { quantita: n })} />
          </label>
          <span style={styles.hint}>{(GS_PUNTI_ESPERIENZA[m.gs] ?? 0) * (Number(m.quantita) || 0)} PE</span>
          <button style={styles.removeX} onClick={() => rimuoviMostroScelto(m.id)}>✕</button>
        </div>
      ))}

      <div style={styles.sectionDivider} />

      <div style={styles.risultatoIncontroBox}>
        <div style={styles.hint}>PE totale dei mostri: {peBase} · Moltiplicatore per {numeroMostriTotale} mostri e {numeroGiocatori} giocatori: ×{moltiplicatore}</div>
        <div style={styles.totalText}>PE Adeguato: {peAdeguato}</div>
        <div style={{ ...styles.difficoltaGrande, ...coloreDifficolta }}>{difficolta}</div>
      </div>
    </div>
  );
}

export default TrackerIncontriTab;
