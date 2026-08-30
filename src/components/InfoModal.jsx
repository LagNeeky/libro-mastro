import React from "react";
import { styles, palette } from "../styles.js";

export default function InfoModal({ onClose }) {
  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modalBoxWide} onClick={(e) => e.stopPropagation()}>
        <button style={styles.modalClose} onClick={onClose}>✕</button>
        <h3 style={styles.modalTitle}>Come funziona Libro Mastro</h3>

        <p style={styles.modalDesc}><strong style={{ color: palette.gold }}>I tuoi dati restano sul tuo dispositivo.</strong> Schede, appunti, mappe e contenuti homebrew vengono salvati automaticamente qui, nel browser che stai usando — nessun server esterno li riceve. Se cambi dispositivo o browser, dovrai trasferirli manualmente (vedi sotto).</p>

        <p style={styles.modalDesc}><strong style={{ color: palette.gold }}>Scambiare una scheda con un altro giocatore.</strong> Nella tab "Schede PG", ogni personaggio ha un tasto <em>Esporta</em> che scarica un file <code>.json</code> con tutti i suoi dati. Puoi mandare quel file a chiunque tramite chat, email o come preferisci. Chi lo riceve usa il tasto <em>Importa scheda</em> nella stessa tab per caricarlo nella propria copia dell'app.</p>

        <p style={styles.modalDesc}><strong style={{ color: palette.gold }}>Mappe e documenti.</strong> Si caricano scegliendo un file dal tuo dispositivo con l'apposito tasto "Carica" — l'app non può accedere automaticamente a nessuna cartella, per motivi di sicurezza dei browser: dovrai scegliere il file ogni volta, ma puoi tenerteli organizzati in una tua cartella personale sul dispositivo.</p>

        <p style={styles.modalDesc}><strong style={{ color: palette.gold }}>Contenuti homebrew.</strong> Tutto ciò che aggiungi con i tasti "+ Nuovo" (razze, classi, incantesimi, equipaggiamento) resta salvato insieme al resto dei tuoi dati. Se in futuro l'app viene aggiornata con nuovi contenuti ufficiali, questi si aggiungono automaticamente senza toccare i tuoi homebrew.</p>

        <p style={styles.modalDesc}><strong style={{ color: palette.gold }}>Funziona offline.</strong> Dopo il primo caricamento, l'app continua a funzionare anche senza connessione internet. Su iPhone/Android puoi aggiungerla alla schermata Home dal menu di condivisione del browser, per aprirla come un'app vera.</p>
      </div>
    </div>
  );
}
