import React, { useState } from 'react';
import { styles } from '../styles.js';
import { uid, mod, fmt, ABILITIES, ABILITY_LABELS } from '../utils/helpers.js';
import { newCreatura, GS_BONUS_COMPETENZA } from '../data/creatura.js';
import { AutoTextarea, NumInput } from './shared.jsx';

function ListaLibera({ titolo, voci, onChange, placeholderNome, placeholderDesc }) {
  const aggiungi = () => onChange([...voci, { id: uid(), nome: "", desc: "" }]);
  const aggiorna = (id, patch) => onChange(voci.map((v) => (v.id === id ? { ...v, ...patch } : v)));
  const rimuovi = (id) => onChange(voci.filter((v) => v.id !== id));
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={styles.columnTitleLeft}>{titolo}</div>
      {voci.map((v) => (
        <div key={v.id} style={styles.itemGroup}>
          <div style={styles.itemRow}>
            <input style={{ ...styles.overrideInput, flex: 1, fontWeight: 700 }} placeholder={placeholderNome} value={v.nome} onChange={(e) => aggiorna(v.id, { nome: e.target.value })} />
            <button style={styles.pgDelBtn} onClick={() => rimuovi(v.id)}>✕</button>
          </div>
          <AutoTextarea style={styles.itemNoteInput} placeholder={placeholderDesc} value={v.desc} onChange={(e) => aggiorna(v.id, { desc: e.target.value })} />
        </div>
      ))}
      <button style={styles.smallBtn} onClick={aggiungi}>+ Aggiungi</button>
    </div>
  );
}

function SchedeMostriTab({ mostri, setMostri, openD20Roll, openDiceRoll }) {
  const [attivoId, setAttivoId] = useState(mostri[0]?.id || null);
  const [query, setQuery] = useState("");
  const attivo = mostri.find((m) => m.id === attivoId) || mostri[0];

  const aggiungiMostro = () => {
    const nuovo = { ...newCreatura(), id: uid() };
    setMostri([...mostri, nuovo]);
    setAttivoId(nuovo.id);
  };
  const duplicaMostro = (m) => {
    const copia = { ...m, id: uid(), nome: m.nome + " (copia)" };
    setMostri([...mostri, copia]);
    setAttivoId(copia.id);
  };
  const rimuoviMostro = (id) => {
    const nuovi = mostri.filter((m) => m.id !== id);
    setMostri(nuovi);
    if (attivoId === id) setAttivoId(nuovi[0]?.id || null);
  };
  const updateAttivo = (patch) => setMostri(mostri.map((m) => (m.id === attivo.id ? { ...m, ...patch } : m)));

  if (!attivo) {
    return (
      <div style={styles.panel}>
        <h2 style={styles.panelTitle}>Schede Mostri & PNG</h2>
        <p style={styles.hint}>Nessuna scheda creata. Crea la prima scheda semplificata per un mostro o un PNG.</p>
        <button style={styles.primaryBtn} onClick={aggiungiMostro}>+ Nuova Scheda</button>
      </div>
    );
  }

  const modByAb = {};
  ABILITIES.forEach((a) => { modByAb[a] = mod(attivo.abilita[a]); });
  const bonusComp = GS_BONUS_COMPETENZA[attivo.gs] ?? 2;
  const elenco = mostri.filter((m) => m.nome.toLowerCase().includes(query.toLowerCase()));

  return (
    <div style={styles.panel}>
      <h2 style={styles.panelTitle}>Schede Mostri & PNG</h2>
      <p style={styles.hint}>Schede semplificate pensate per il Master: molte meno informazioni di una Scheda PG, giusto quanto basta per gestire un combattimento o un incontro.</p>

      <div style={styles.pgSelectorRow}>
        <input style={styles.searchInput} placeholder="Cerca tra le tue schede..." value={query} onChange={(e) => setQuery(e.target.value)} />
        <select style={styles.pgSelect} value={attivo.id} onChange={(e) => setAttivoId(e.target.value)}>
          {elenco.map((m) => <option key={m.id} value={m.id}>{m.nome} ({m.tipo}, GS {m.gs})</option>)}
        </select>
        <button style={styles.newPgBtn} onClick={aggiungiMostro}>+ Nuova</button>
        <button style={styles.smallBtn} onClick={() => duplicaMostro(attivo)}>⧉ Duplica</button>
        <button style={{ ...styles.pgDelBtn, marginLeft: "auto" }} onClick={() => rimuoviMostro(attivo.id)}>✕</button>
      </div>

      <div style={{ ...styles.sectionDivider, marginTop: 16, marginBottom: 16 }} />

      <div style={styles.invRow}>
        <input style={{ ...styles.invNome, fontWeight: 700, fontSize: 16 }} value={attivo.nome} onChange={(e) => updateAttivo({ nome: e.target.value })} />
        <select style={styles.invPos} value={attivo.tipo} onChange={(e) => updateAttivo({ tipo: e.target.value })}>
          <option value="Mostro">Mostro</option>
          <option value="PNG">PNG</option>
        </select>
        <div style={styles.invSpacer} />
      </div>
      <div style={styles.invRow}>
        <input style={styles.invNome} placeholder="Taglia (es. Media)" value={attivo.taglia} onChange={(e) => updateAttivo({ taglia: e.target.value })} />
        <input style={styles.invPos} placeholder="Allineamento" value={attivo.allineamento} onChange={(e) => updateAttivo({ allineamento: e.target.value })} />
        <div style={styles.invSpacer} />
      </div>

      <div style={styles.hpGrid}>
        <div style={styles.hpBox}>
          <div style={styles.hpBoxLabel}>Grado di Sfida</div>
          <input
            style={styles.gsInput}
            value={attivo.gs}
            onChange={(e) => updateAttivo({ gs: e.target.value })}
            onBlur={(e) => { if (!(e.target.value in GS_BONUS_COMPETENZA)) updateAttivo({ gs: "1" }); }}
            onWheel={(e) => {
              e.preventDefault();
              const chiavi = Object.keys(GS_BONUS_COMPETENZA);
              const idxAttuale = chiavi.indexOf(attivo.gs);
              const idx = idxAttuale === -1 ? 0 : idxAttuale;
              const nuovoIdx = Math.max(0, Math.min(chiavi.length - 1, idx + (e.deltaY < 0 ? 1 : -1)));
              updateAttivo({ gs: chiavi[nuovoIdx] });
            }}
            title="Scrivi il Grado di Sfida a mano, oppure usa la rotellina del mouse per scorrere i valori"
          />
          <div style={styles.slotEmptyHint}>Comp. {fmt(bonusComp)}</div>
        </div>
        <div style={styles.hpBox}>
          <div style={styles.hpBoxLabel}>Classe Armatura</div>
          <NumInput min={0} max={40} style={styles.hpBoxInput} value={attivo.ca} onCommit={(n) => updateAttivo({ ca: n })} />
          <input style={styles.hpBoxSmallInput} placeholder="es. armatura naturale" value={attivo.caNote} onChange={(e) => updateAttivo({ caNote: e.target.value })} />
        </div>
        <div style={styles.hpBox}>
          <div style={styles.hpBoxLabel}>PF Massimi</div>
          <NumInput min={0} max={9999} style={styles.hpBoxInput} value={attivo.pfMax} onCommit={(n) => updateAttivo({ pfMax: n, pfAttuali: Math.min(attivo.pfAttuali, n) })} />
          <input style={styles.hpBoxSmallInput} placeholder="formula (es. 8d8+16)" value={attivo.pfFormula} onChange={(e) => updateAttivo({ pfFormula: e.target.value })} />
        </div>
        <div style={styles.hpBox}>
          <div style={styles.hpBoxLabel}>PF Attuali</div>
          <NumInput min={0} max={9999} style={styles.hpBoxInput} value={attivo.pfAttuali} onCommit={(n) => updateAttivo({ pfAttuali: Math.max(0, Math.min(n, attivo.pfMax)) })} />
          <button style={styles.smallBtn} onClick={() => updateAttivo({ pfAttuali: attivo.pfMax })}>Ripristina</button>
        </div>
        <div style={styles.hpBox}>
          <div style={styles.hpBoxLabel}>Velocità</div>
          <input style={styles.hpBoxSmallInput} value={attivo.velocita} onChange={(e) => updateAttivo({ velocita: e.target.value })} />
        </div>
      </div>

      <div style={styles.sectionLabel}>Caratteristiche</div>
      <div style={styles.abilityGrid}>
        {ABILITIES.map((a) => (
          <div key={a} style={styles.abilityCard}>
            <div style={styles.abilityName}>{ABILITY_LABELS[a]}</div>
            <NumInput min={1} max={30} style={styles.abilityScoreInput} value={attivo.abilita[a]} onCommit={(n) => updateAttivo({ abilita: { ...attivo.abilita, [a]: n } })} />
            <div style={styles.abilityModRow}>
              <span style={styles.abilityMod}>{fmt(modByAb[a])}</span>
              <button style={styles.diceBtn} onClick={() => openD20Roll({ title: `Prova di ${ABILITY_LABELS[a]} — ${attivo.nome}`, modifier: modByAb[a], modifierLabel: `${ABILITY_LABELS[a]} ${fmt(modByAb[a])}` })}>🎲</button>
            </div>
          </div>
        ))}
      </div>

      <div style={styles.invRow}>
        <div style={styles.invNome}>Tiri Salvezza con Competenza</div>
        <input style={styles.invPos} placeholder="es. Des +5, Sag +3" value={attivo.tiriSalvezza} onChange={(e) => updateAttivo({ tiriSalvezza: e.target.value })} />
        <div style={styles.invSpacer} />
      </div>
      <div style={styles.invRow}>
        <div style={styles.invNome}>Abilità con Competenza</div>
        <input style={styles.invPos} placeholder="es. Percezione +5, Furtività +4" value={attivo.competenzeAbilita} onChange={(e) => updateAttivo({ competenzeAbilita: e.target.value })} />
        <div style={styles.invSpacer} />
      </div>
      <div style={styles.invRow}>
        <div style={styles.invNome}>Resistenze ai Danni</div>
        <input style={styles.invPos} value={attivo.resistenze} onChange={(e) => updateAttivo({ resistenze: e.target.value })} />
        <div style={styles.invSpacer} />
      </div>
      <div style={styles.invRow}>
        <div style={styles.invNome}>Immunità ai Danni</div>
        <input style={styles.invPos} value={attivo.immunitaDanno} onChange={(e) => updateAttivo({ immunitaDanno: e.target.value })} />
        <div style={styles.invSpacer} />
      </div>
      <div style={styles.invRow}>
        <div style={styles.invNome}>Immunità alle Condizioni</div>
        <input style={styles.invPos} value={attivo.immunitaCondizione} onChange={(e) => updateAttivo({ immunitaCondizione: e.target.value })} />
        <div style={styles.invSpacer} />
      </div>
      <div style={styles.invRow}>
        <div style={styles.invNome}>Sensi</div>
        <input style={styles.invPos} placeholder="es. Scurovisione 18 m, Percezione Passiva 13" value={attivo.sensi} onChange={(e) => updateAttivo({ sensi: e.target.value })} />
        <div style={styles.invSpacer} />
      </div>
      <div style={styles.invRow}>
        <div style={styles.invNome}>Linguaggi</div>
        <input style={styles.invPos} value={attivo.linguaggi} onChange={(e) => updateAttivo({ linguaggi: e.target.value })} />
        <div style={styles.invSpacer} />
      </div>

      <div style={styles.sectionDivider} />

      <ListaLibera titolo="Tratti" voci={attivo.tratti} onChange={(v) => updateAttivo({ tratti: v })} placeholderNome="Nome tratto" placeholderDesc="Descrizione" />
      <ListaLibera titolo="Azioni" voci={attivo.azioni} onChange={(v) => updateAttivo({ azioni: v })} placeholderNome="Nome azione (es. Morso)" placeholderDesc="Descrizione, es: Attacco con arma da mischia: +5 a colpire, portata 1,5 m, un bersaglio. Colpito: 7 (1d10+2) danni perforanti." />
      <ListaLibera titolo="Azioni Leggendarie" voci={attivo.azioniLeggendarie} onChange={(v) => updateAttivo({ azioniLeggendarie: v })} placeholderNome="Nome" placeholderDesc="Descrizione" />
      <ListaLibera titolo="Reazioni" voci={attivo.reazioni} onChange={(v) => updateAttivo({ reazioni: v })} placeholderNome="Nome" placeholderDesc="Descrizione" />

      <div style={styles.sectionLabel}>Note del Master</div>
      <AutoTextarea style={{ ...styles.notes, minHeight: 100 }} value={attivo.note} onChange={(e) => updateAttivo({ note: e.target.value })} placeholder="Tattiche, motivazioni, collegamenti alla trama..." />
    </div>
  );
}

export default SchedeMostriTab;
