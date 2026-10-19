# Politica di Sicurezza

## Come funziona Libro Mastro

Libro Mastro è un'applicazione web statica (React + Vite), ospitata su GitHub Pages. Non ha un backend né un database remoto: tutti i dati (schede, appunti, mappe, contenuti homebrew) vengono salvati esclusivamente in locale, nel browser di chi lo usa, tramite IndexedDB. Nessun dato viene inviato a server esterni.

Questo riduce molto la superficie di rischio tipica di altre applicazioni, ma non la esclude del tutto: dipendenze di terze parti, il codice dell'app stessa o la configurazione del sito potrebbero comunque presentare vulnerabilità.

## Versioni supportate

Il progetto non segue un versionamento formale: viene mantenuta e aggiornata una sola versione, quella pubblicata su `main` e distribuita su GitHub Pages. Le segnalazioni di sicurezza vanno quindi sempre riferite alla versione attualmente online.

## Segnalare una vulnerabilità

Se trovi un problema di sicurezza (ad esempio una falla che permetterebbe di eseguire codice arbitrario, di accedere ai dati di un altro utente, o di compromettere in qualche modo il sito), ti chiediamo di **non aprire una issue pubblica**. Segnala invece il problema privatamente, usando una di queste modalità:

- Tramite la funzione **"Report a vulnerability"** nella tab Security del repository GitHub (se disponibile)
- In alternativa, contatta direttamente il mantenitore del repository tramite GitHub

Nella segnalazione, se possibile, includi:
- Una descrizione di cosa hai trovato e perché lo consideri un problema di sicurezza
- I passaggi per riprodurlo
- L'impatto potenziale che ritieni possa avere

Non essendo un progetto con una struttura dedicata alla sicurezza, non possiamo garantire tempistiche di risposta formali, ma ogni segnalazione verrà letta e presa sul serio, e risolta con la massima priorità possibile.

## Cosa non rientra in questa politica

Dato che l'app non raccoglie né elabora dati su un server, segnalazioni relative a privacy di dati server-side, autenticazione o simili non si applicano: non esiste nessuno di questi componenti. Restano invece valide le segnalazioni relative a vulnerabilità del codice client-side (ad esempio XSS), a dipendenze con vulnerabilità note, o alla configurazione del deployment.
