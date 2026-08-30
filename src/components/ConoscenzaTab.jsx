import React, { useState, useRef } from 'react';
import { styles } from '../styles.js';
import { uid } from '../utils/helpers.js';

function ConoscenzaTab({ documenti, setDocumenti }) {
  const fileInputRef = useRef(null);
  const [viewingId, setViewingId] = useState(null);
  const viewing = documenti.find((d) => d.id === viewingId);

  const handleFiles = (e) => {
    const files = Array.from(e.target.files || []);
    files.forEach((file) => {
      const ext = file.name.split(".").pop().toLowerCase();
      if (ext === "txt") {
        const reader = new FileReader();
        reader.onload = () => setDocumenti((d) => [...d, { id: uid(), nome: file.name, tipo: "txt", contenuto: String(reader.result) }]);
        reader.readAsText(file);
      } else if (ext === "pdf") {
        const reader = new FileReader();
        reader.onload = () => setDocumenti((d) => [...d, { id: uid(), nome: file.name, tipo: "pdf", url: String(reader.result) }]);
        reader.readAsDataURL(file);
      }
    });
    e.target.value = "";
  };
  const rimuovi = (id) => setDocumenti((d) => d.filter((x) => x.id !== id));

  return (
    <div style={styles.panel}>
      <h2 style={styles.panelTitle}>Conoscenza</h2>
      <p style={styles.hint}>Materiale dato dal master: documenti di testo o PDF consultabili direttamente qui, senza uscire dall'app.</p>
      <input ref={fileInputRef} type="file" accept=".txt,.pdf" multiple style={{ display: "none" }} onChange={handleFiles} />
      <button style={styles.primaryBtn} onClick={() => fileInputRef.current?.click()}>+ Carica documento (.txt o .pdf)</button>
      {documenti.length === 0 && <div style={{ ...styles.hint, marginTop: 12 }}>Nessun documento caricato.</div>}
      <div style={{ ...styles.cardGrid, marginTop: 14 }}>
        {documenti.map((d) => (
          <div key={d.id} style={styles.dataCard}>
            <div style={styles.dataCardTitleStatic}>{d.nome}</div>
            <div style={styles.hint}>{d.tipo === "pdf" ? "Documento PDF" : "Documento di testo"}</div>
            <div style={styles.cardBtnRow}>
              <button style={styles.smallBtn} onClick={() => setViewingId(d.id)}>Apri</button>
              <button style={styles.smallDangerBtn} onClick={() => rimuovi(d.id)}>Rimuovi</button>
            </div>
          </div>
        ))}
      </div>
      {viewing && (
        <div style={styles.overlay} onClick={() => setViewingId(null)}>
          <div style={styles.modalBoxWide} onClick={(e) => e.stopPropagation()}>
            <button style={styles.modalClose} onClick={() => setViewingId(null)}>✕</button>
            <h3 style={styles.modalTitle}>{viewing.nome}</h3>
            {viewing.tipo === "pdf" ? (
              <div>
                <div style={styles.formRow}>
                  <a href={viewing.url} target="_blank" rel="noreferrer" style={styles.smallBtnLink}>↗ Apri in una nuova scheda</a>
                  <a href={viewing.url} download={viewing.nome} style={styles.smallBtnLink}>⬇ Scarica il PDF</a>
                </div>
                <div style={styles.hint}>Se l'anteprima qui sotto resta bianca, è un limite della sandbox di questa chat: usa i link sopra per verificare il file, funzionerà normalmente nell'app pubblicata.</div>
                <iframe title={viewing.nome} src={viewing.url} style={styles.pdfFrame} />
              </div>
            ) : (
              <pre style={styles.txtViewer}>{viewing.contenuto}</pre>
            )}
          </div>
        </div>
      )}
    </div>
  );
}


export default ConoscenzaTab;
