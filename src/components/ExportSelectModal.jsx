import React, { useState } from 'react';
import { styles } from '../styles.js';
import { esportaComeZip } from '../utils/importExport.js';

// gruppi: [{ tipo: "razza", etichetta: "Razze", elementi: [...] }, ...]
function ExportSelectModal({ gruppi, nomeZip, onClose }) {
  const [selezionati, setSelezionati] = useState(() => new Set());
  const [esportando, setEsportando] = useState(false);

  const chiave = (tipo, id) => `${tipo}::${id}`;
  const toggle = (tipo, id) => {
    const k = chiave(tipo, id);
    setSelezionati((s) => { const n = new Set(s); if (n.has(k)) n.delete(k); else n.add(k); return n; });
  };
  const selezionaTutti = (tipo, elementi) => {
    setSelezionati((s) => {
      const n = new Set(s);
      const tuttiSelezionati = elementi.every((e) => n.has(chiave(tipo, e.id)));
      elementi.forEach((e) => { if (tuttiSelezionati) n.delete(chiave(tipo, e.id)); else n.add(chiave(tipo, e.id)); });
      return n;
    });
  };

  const totaleSelezionati = selezionati.size;

  const confermaEsporta = async () => {
    setEsportando(true);
    const elementiConTipo = [];
    gruppi.forEach((g) => {
      g.elementi.forEach((e) => { if (selezionati.has(chiave(g.tipo, e.id))) elementiConTipo.push({ tipo: g.tipo, dato: e }); });
    });
    await esportaComeZip(elementiConTipo, nomeZip);
    setEsportando(false);
    onClose();
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={{ ...styles.modalBox, maxWidth: 600, maxHeight: "80vh", overflowY: "auto" }} onClick={(e) => e.stopPropagation()}>
        <button style={styles.modalClose} onClick={onClose}>✕</button>
        <h3 style={styles.modalTitle}>Cosa vuoi esportare?</h3>
        <p style={styles.hint}>Spunta gli elementi che vuoi scaricare. Verranno salvati in un unico file .zip, un file .json per ciascuno, pronti per essere condivisi e reimportati da un altro giocatore.</p>
        {gruppi.map((g) => (
          <div key={g.tipo} style={{ marginBottom: 14 }}>
            <div style={styles.columnTitleLeft}>
              {g.etichetta} ({g.elementi.length})
              {g.elementi.length > 0 && <button style={{ ...styles.smallBtn, marginLeft: 10 }} onClick={() => selezionaTutti(g.tipo, g.elementi)}>Seleziona/Deseleziona tutti</button>}
            </div>
            <div style={styles.cardGrid}>
              {g.elementi.map((e) => (
                <label key={e.id} style={styles.checkField}>
                  <input type="checkbox" checked={selezionati.has(chiave(g.tipo, e.id))} onChange={() => toggle(g.tipo, e.id)} />
                  {e.nome}{e.custom ? " ★" : ""}
                </label>
              ))}
              {g.elementi.length === 0 && <span style={styles.hint}>Nessun elemento in questa categoria.</span>}
            </div>
          </div>
        ))}
        <button style={styles.primaryBtn} disabled={totaleSelezionati === 0 || esportando} onClick={confermaEsporta}>
          {esportando ? "Preparazione in corso..." : `⬇ Scarica ${totaleSelezionati} elemento/i selezionato/i`}
        </button>
      </div>
    </div>
  );
}

export default ExportSelectModal;
