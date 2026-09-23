import React, { useState } from 'react';
import { styles } from '../styles.js';
import { uid } from '../utils/helpers.js';
import { AutoTextarea } from './shared.jsx';
import { newTrackingPG } from '../data/trackingPG.js';

function TracciamentoPGTab({ personaggi, tracking, setTracking, apriEntitaId }) {
  const [pgSelezionatoId, setPgSelezionatoId] = useState(personaggi[0]?.id || null);

  React.useEffect(() => {
    if (apriEntitaId?.tipo === "pg_narrativo" && apriEntitaId.id) setPgSelezionatoId(apriEntitaId.id);
  }, [apriEntitaId]);

  const pgSelezionato = personaggi.find((p) => p.id === pgSelezionatoId) || personaggi[0];

  if (!pgSelezionato) {
    return (
      <div style={styles.panel}>
        <h2 style={styles.panelTitle}>Tracciamento PG</h2>
        <p style={styles.hint}>Nessun Personaggio Giocante trovato. Crea prima una Scheda PG dal tab "Schede PG" per poterne tracciare qui i legami e gli obiettivi narrativi.</p>
      </div>
    );
  }

  const record = tracking.find((t) => t.pgId === pgSelezionato.id) || newTrackingPG(pgSelezionato.id);
  const aggiorna = (patch) => {
    if (tracking.some((t) => t.pgId === pgSelezionato.id)) {
      setTracking(tracking.map((t) => (t.pgId === pgSelezionato.id ? { ...t, ...patch } : t)));
    } else {
      setTracking([...tracking, { ...newTrackingPG(pgSelezionato.id), id: uid(), ...patch }]);
    }
  };

  return (
    <div style={styles.panel}>
      <h2 style={styles.panelTitle}>Tracciamento PG</h2>
      <p style={styles.hint}>Uno spazio narrativo per il Master: legami, obiettivi personali e come si sta evolvendo la storia di ogni giocatore. Separato dalla Scheda PG meccanica — qui puoi anche annotare segreti che il giocatore non conosce ancora.</p>

      <div style={styles.pgSelectorRow}>
        <select style={styles.pgSelect} value={pgSelezionato.id} onChange={(e) => setPgSelezionatoId(e.target.value)}>
          {personaggi.map((p) => <option key={p.id} value={p.id}>{p.nome}</option>)}
        </select>
      </div>

      <div style={{ ...styles.sectionDivider, marginTop: 16, marginBottom: 16 }} />

      <div style={styles.sectionLabel}>Legami</div>
      <AutoTextarea style={{ ...styles.notes, minHeight: 80 }} value={record.legami} onChange={(e) => aggiorna({ legami: e.target.value })} placeholder="PNG, luoghi o eventi a cui questo personaggio è legato emotivamente..." />

      <div style={styles.sectionLabel}>Obiettivi Personali</div>
      <AutoTextarea style={{ ...styles.notes, minHeight: 80 }} value={record.obiettiviPersonali} onChange={(e) => aggiorna({ obiettiviPersonali: e.target.value })} placeholder="Cosa vuole ottenere questo personaggio, a breve e lungo termine..." />

      <div style={styles.sectionLabel}>Evoluzione della Storia</div>
      <AutoTextarea style={{ ...styles.notes, minHeight: 100 }} value={record.evoluzioneStoria} onChange={(e) => aggiorna({ evoluzioneStoria: e.target.value })} placeholder="Come sta cambiando questo personaggio nel corso della campagna, tappe importanti già vissute..." />

      <div style={styles.sectionLabel}>Segreti (non ancora noti al giocatore)</div>
      <AutoTextarea style={{ ...styles.notes, minHeight: 70 }} value={record.segreti} onChange={(e) => aggiorna({ segreti: e.target.value })} placeholder="Rivelazioni future, verità nascoste sul suo passato..." />

      <div style={styles.sectionLabel}>Note del Master</div>
      <AutoTextarea style={{ ...styles.notes, minHeight: 70 }} value={record.note} onChange={(e) => aggiorna({ note: e.target.value })} />
    </div>
  );
}

export default TracciamentoPGTab;
