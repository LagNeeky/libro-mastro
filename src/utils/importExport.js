import JSZip from 'jszip';

// Nomi file sicuri (senza caratteri problematici)
function nomeFileSicuro(nome) {
  return (nome || "senza_nome").replace(/[^a-z0-9\-_]+/gi, "_").toLowerCase();
}

// Esporta una lista di elementi selezionati come file .json individuali, raggruppati in un unico .zip da scaricare.
// Ogni elemento viene salvato con un campo "_tipo" che ne identifica la categoria, usato poi in fase di importazione.
async function esportaComeZip(elementiConTipo, nomeZip) {
  const zip = new JSZip();
  const nomiUsati = new Set();
  elementiConTipo.forEach(({ tipo, dato }) => {
    let nomeFile = nomeFileSicuro(dato.nome) + ".json";
    let i = 2;
    while (nomiUsati.has(nomeFile)) { nomeFile = `${nomeFileSicuro(dato.nome)}_${i}.json`; i++; }
    nomiUsati.add(nomeFile);
    const contenuto = { _tipo: tipo, ...dato };
    zip.file(nomeFile, JSON.stringify(contenuto, null, 2));
  });
  const blob = await zip.generateAsync({ type: "blob" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${nomeFileSicuro(nomeZip)}.zip`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Legge una lista di file scelti dall'utente (.json singoli o .zip contenenti più .json) e restituisce
// un array di { tipo, dato } pronti per essere smistati nei cataloghi giusti.
async function leggiFileImportati(fileList) {
  const risultati = [];
  const file = Array.from(fileList);
  for (const f of file) {
    if (f.name.toLowerCase().endsWith(".zip")) {
      const zip = await JSZip.loadAsync(f);
      const nomi = Object.keys(zip.files).filter((n) => n.toLowerCase().endsWith(".json"));
      for (const nome of nomi) {
        try {
          const testo = await zip.files[nome].async("string");
          const obj = JSON.parse(testo);
          if (obj && obj._tipo) risultati.push({ tipo: obj._tipo, dato: obj });
        } catch (e) { /* file corrotto o non valido, lo saltiamo */ }
      }
    } else {
      try {
        const testo = await f.text();
        const obj = JSON.parse(testo);
        if (obj && obj._tipo) risultati.push({ tipo: obj._tipo, dato: obj });
      } catch (e) { /* file corrotto o non valido, lo saltiamo */ }
    }
  }
  return risultati;
}

export { esportaComeZip, leggiFileImportati };

// Smista gli elementi letti da leggiFileImportati nei cataloghi giusti, in base al loro "_tipo".
// Ogni elemento importato riceve sempre un nuovo id (per non rischiare di sovrascrivere per errore
// una voce esistente con lo stesso id) e viene marcato come custom:true.
// mappaSetter: { razza: setRazze, sottorazza: setSottorazze, ... }
// Restituisce { importati: numero, ignorati: numero, tipiIgnorati: [] }
function smistaEImporta(risultati, mappaSetter, uidFn) {
  let importati = 0;
  const tipiIgnorati = new Set();
  const daAggiungerePerTipo = {};
  risultati.forEach(({ tipo, dato }) => {
    if (!mappaSetter[tipo]) { tipiIgnorati.add(tipo); return; }
    const { _tipo, ...pulito } = dato;
    const nuovo = { ...pulito, id: uidFn(), custom: true };
    if (!daAggiungerePerTipo[tipo]) daAggiungerePerTipo[tipo] = [];
    daAggiungerePerTipo[tipo].push(nuovo);
    importati++;
  });
  Object.entries(daAggiungerePerTipo).forEach(([tipo, nuovi]) => {
    mappaSetter[tipo]((s) => [...s, ...nuovi]);
  });
  return { importati, ignorati: risultati.length - importati, tipiIgnorati: [...tipiIgnorati] };
}

export { smistaEImporta };
