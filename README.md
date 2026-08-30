# Libro Mastro

Compagno di campagna per D&D 5e: schede personaggio, regole, incantesimi, equipaggiamento e strumenti di gioco, tutto in un'unica app.

## Come pubblicarla online (GitHub Pages)

Segui questi passaggi una sola volta.

### 1. Crea il repository su GitHub
1. Vai su [github.com](https://github.com) e accedi (o crea un account gratuito).
2. Clicca su **"New repository"**.
3. Dai un nome al repository, ad esempio `libro-mastro` (se scegli un nome diverso, leggi la nota importante più sotto).
4. Lascialo **pubblico** e crealo (non serve aggiungere nulla, repository vuoto va bene).

### 2. Carica i file
Hai due modi, scegli quello che preferisci:

**A) Dal sito web di GitHub (più semplice)**
1. Apri il repository appena creato.
2. Clicca su "uploading an existing file".
3. Trascina dentro **tutto il contenuto di questa cartella** (tranne `node_modules`, che non c'è comunque nello zip che hai scaricato).
4. Scrivi un messaggio a piacere (es. "Primo caricamento") e conferma.

**B) Con GitHub Desktop (più comodo per gli aggiornamenti futuri)**
1. Installa [GitHub Desktop](https://desktop.github.com/) (gratuito).
2. Collega il tuo account GitHub.
3. Clona il repository vuoto sul tuo computer.
4. Copia tutti i file di questa cartella dentro quella clonata.
5. In GitHub Desktop, scrivi un messaggio e clicca "Commit" poi "Push".

### 3. Importante: controlla il nome nel file di configurazione
Apri il file `vite.config.js` e controlla questa riga:
```js
const BASE_PATH = "/libro-mastro/";
```
Deve corrispondere **esattamente** al nome del tuo repository. Se hai chiamato il repository in modo diverso da `libro-mastro`, cambia questa riga di conseguenza (es. `/nome-repository/`) prima di caricare i file, altrimenti l'app non troverà i suoi stessi file una volta online.

### 4. Attiva GitHub Pages
1. Nel repository, vai su **Settings → Pages**.
2. Alla voce "Source", scegli **"GitHub Actions"** (non "Deploy from a branch").
3. Fatto! Al primo caricamento dei file parte automaticamente la pubblicazione (la vedi in corso nella scheda "Actions" del repository, richiede uno o due minuti).

### 5. Il tuo link
Una volta completata la pubblicazione, l'app sarà visitabile all'indirizzo:
```
https://tuo-nome-utente.github.io/libro-mastro/
```
(sostituendo "tuo-nome-utente" e "libro-mastro" con i tuoi dati reali)

Condividi questo link con i tuoi giocatori: possono aprirlo da qualsiasi browser, su Windows o iPhone, e aggiungerlo alla schermata Home per usarlo come un'app vera anche offline.

## Aggiornamenti futuri

Da questo momento, ogni volta che carichi nuovi file sul repository (nuovi incantesimi, correzioni, nuove funzioni), la pubblicazione **avviene da sola** — non devi fare nient'altro.

## Sviluppo in locale (facoltativo)

Se un giorno vuoi provare modifiche sul tuo computer prima di pubblicarle, ti serve [Node.js](https://nodejs.org) installato, poi:
```
npm install
npm run dev
```
apre un'anteprima live su `http://localhost:5173`.

## Dati e salvataggio

Tutti i dati (schede, appunti, mappe, contenuti homebrew) vengono salvati automaticamente nel browser di ogni dispositivo (IndexedDB) — nessun server esterno li riceve. Per i dettagli su come scambiare le schede tra giocatori, apri il pulsante **"ℹ️ Come funziona"** dentro l'app.
