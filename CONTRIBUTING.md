# Come contribuire a Libro Mastro

Grazie per l'interesse verso il progetto! Che tu voglia segnalare un bug, proporre una nuova funzione o contribuire con del codice, questa guida ti aiuta a partire nel modo giusto.

## Segnalare un problema (bug) o proporre un'idea

Il modo più semplice per contribuire è aprire una **Issue**:

1. Controlla prima tra le [issue esistenti](../../issues) che non sia già stata segnalata
2. Apri una nuova issue scegliendo il template più adatto (bug o richiesta di funzione)
3. Descrivi il più possibile nel dettaglio: cosa stavi facendo, cosa ti aspettavi, cosa è successo invece. Per i bug, uno screenshot aiuta sempre

Non serve saper programmare per aprire una issue utile: anche solo "ho notato che X si comporta in modo strano" è un contributo prezioso.

## Proporre modifiche al codice

Se vuoi contribuire direttamente con delle modifiche:

1. Fai un **fork** del repository
2. Crea un branch dedicato alla tua modifica (`git checkout -b fix/nome-della-modifica`)
3. Lavora sulle tue modifiche
4. Prima di proporle, verifica che il progetto si compili senza errori:
   ```
   npm install
   npm run build
   ```
5. Apri una **Pull Request** verso il branch `main`, descrivendo cosa cambia e perché

### Linee guida sul codice

- Il progetto è una SPA React (Vite), con i dati salvati localmente nel browser (IndexedDB) — non c'è un backend
- I contenuti relativi alle regole di D&D 5e (razze, classi, incantesimi, talenti, equipaggiamento, ecc.) devono contenere **solo nomi e meccaniche di gioco**, con descrizioni scritte con parole proprie. Non vanno copiati testi, descrizioni o passaggi presi direttamente dai manuali ufficiali (sono materiale protetto da copyright di Wizards of the Coast) — vedi anche [SECURITY.md](SECURITY.md) e le note di licenza in [LICENSE](LICENSE)
- Cerca di seguire lo stile già presente nel codice (nomi delle variabili in italiano per i dati di gioco, struttura a tab, hook personalizzati per lo stato persistente)
- Se aggiungi una nuova funzione che tocca più parti dell'app, è utile spiegarlo nella descrizione della PR

## Cosa non è ancora formalizzato

Il progetto è gestito in modo informale, senza una pipeline di test automatici: la verifica principale è che `npm run build` vada a buon fine e che le funzioni esistenti continuino a comportarsi come prima. Se noti un modo migliore di organizzare questo processo, proponilo pure in una issue.

## Domande

Se hai dubbi su come procedere prima ancora di apportare una modifica, apri comunque una issue per discuterne: è meglio chiarire l'approccio prima di investire tempo in una PR che potrebbe non essere la direzione giusta per il progetto.
