import React, { useRef } from 'react';
import { styles } from '../styles.js';

function IdentitaTab({ personaggi, attivoId, setAttivoId, aggiungiPg, rimuoviPg, pg, updatePg }) {
  const fileInputRef = useRef(null);
  const identita = pg.identita || {};
  const aggiorna = (patch) => updatePg({ identita: { ...identita, ...patch } });
  const handleImage = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => aggiorna({ immagineUrl: String(reader.result) });
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  return (
    <div style={styles.schedeLayout}>
      <aside style={styles.sidebar}>
        <div style={styles.sidebarTitle}>I tuoi personaggi</div>
        {personaggi.map((p) => (
          <div key={p.id} style={{ ...styles.pgListItem, ...(p.id === attivoId ? styles.pgListItemActive : {}) }}>
            <button style={styles.pgListBtn} onClick={() => setAttivoId(p.id)}><span style={styles.pgListName}>{p.nome || "Senza nome"}</span></button>
            <button style={styles.pgDelBtn} onClick={() => rimuoviPg(p.id)}>✕</button>
          </div>
        ))}
        <button style={styles.newPgBtn} onClick={aggiungiPg}>+ Nuovo personaggio</button>
      </aside>

      <section style={styles.sheet}>
        <div style={styles.sheetTopRow}>
          <div style={styles.nameInput}>{pg.nome || "Personaggio senza nome"}</div>
        </div>

        <div style={styles.sectionLabel}>Immagine</div>
        <input ref={fileInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleImage} />
        {identita.immagineUrl ? (
          <div>
            <img src={identita.immagineUrl} alt={pg.nome} style={styles.identityImage} />
            <div style={styles.cardBtnRow}>
              <button style={styles.smallBtn} onClick={() => fileInputRef.current?.click()}>Cambia immagine</button>
              <button style={styles.smallDangerBtn} onClick={() => aggiorna({ immagineUrl: "" })}>Rimuovi</button>
            </div>
          </div>
        ) : (
          <button style={styles.primaryBtn} onClick={() => fileInputRef.current?.click()}>+ Carica immagine</button>
        )}

        <div style={styles.sectionLabel}>Fattezze</div>
        <div style={styles.identityFieldsRow}>
          <label style={styles.miniField}>Età<input style={styles.miniInput} value={identita.eta} onChange={(e) => aggiorna({ eta: e.target.value })} /></label>
          <label style={styles.miniField}>Altezza<input style={styles.miniInput} value={identita.altezza} onChange={(e) => aggiorna({ altezza: e.target.value })} /></label>
          <label style={styles.miniField}>Peso<input style={styles.miniInput} value={identita.peso} onChange={(e) => aggiorna({ peso: e.target.value })} /></label>
          <label style={styles.miniField}>Occhi<input style={styles.miniInput} value={identita.occhi} onChange={(e) => aggiorna({ occhi: e.target.value })} /></label>
          <label style={styles.miniField}>Capelli<input style={styles.miniInput} value={identita.capelli} onChange={(e) => aggiorna({ capelli: e.target.value })} /></label>
          <label style={styles.miniField}>Carnagione<input style={styles.miniInput} value={identita.carnagione} onChange={(e) => aggiorna({ carnagione: e.target.value })} /></label>
        </div>

        <div style={styles.sectionLabel}>Segni particolari</div>
        <textarea style={styles.notes} value={identita.segniParticolari} onChange={(e) => aggiorna({ segniParticolari: e.target.value })} placeholder="Cicatrici, tatuaggi, marchi di nascita..." />

        <div style={styles.sectionLabel}>Aspetto fisico</div>
        <textarea style={styles.notes} value={identita.aspettoFisico} onChange={(e) => aggiorna({ aspettoFisico: e.target.value })} placeholder="Descrizione generale: corporatura, portamento, abbigliamento tipico..." />

        <div style={styles.twoCol}>
          <div>
            <div style={styles.sectionLabel}>Tratti della personalità</div>
            <textarea style={styles.notes} value={identita.tratti} onChange={(e) => aggiorna({ tratti: e.target.value })} placeholder="Come si comporta, modi di fare, abitudini..." />
            <div style={styles.columnTitleLeft}>Ideali</div>
            <textarea style={styles.notes} value={identita.ideali} onChange={(e) => aggiorna({ ideali: e.target.value })} placeholder="In cosa crede, cosa lo guida..." />
          </div>
          <div>
            <div style={styles.sectionLabel}>Legami</div>
            <textarea style={styles.notes} value={identita.legami} onChange={(e) => aggiorna({ legami: e.target.value })} placeholder="Persone, luoghi o oggetti a cui tiene..." />
            <div style={styles.columnTitleLeft}>Difetti</div>
            <textarea style={styles.notes} value={identita.difetti} onChange={(e) => aggiorna({ difetti: e.target.value })} placeholder="Debolezze, paure, vizi..." />
          </div>
        </div>

        <div style={styles.sectionLabel}>Storia (Background)</div>
        <textarea style={{ ...styles.notes, minHeight: 160 }} value={identita.storia} onChange={(e) => aggiorna({ storia: e.target.value })} placeholder="Racconta la storia e il passato del personaggio..." />
      </section>
    </div>
  );
}


export default IdentitaTab;
