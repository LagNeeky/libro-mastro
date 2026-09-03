// Tabella ufficiale delle soglie di Punti Esperienza per la difficolta' di uno scontro, per livello del personaggio.
const SOGLIE_PE_PER_LIVELLO = {
  1: { facile: 25, media: 50, difficile: 75, mortale: 100 },
  2: { facile: 50, media: 100, difficile: 150, mortale: 200 },
  3: { facile: 75, media: 150, difficile: 225, mortale: 400 },
  4: { facile: 125, media: 250, difficile: 375, mortale: 500 },
  5: { facile: 250, media: 500, difficile: 750, mortale: 1100 },
  6: { facile: 300, media: 600, difficile: 900, mortale: 1400 },
  7: { facile: 350, media: 750, difficile: 1100, mortale: 1700 },
  8: { facile: 450, media: 900, difficile: 1400, mortale: 2100 },
  9: { facile: 550, media: 1100, difficile: 1600, mortale: 2400 },
  10: { facile: 600, media: 1200, difficile: 1900, mortale: 2800 },
  11: { facile: 800, media: 1600, difficile: 2400, mortale: 3600 },
  12: { facile: 1000, media: 2000, difficile: 3000, mortale: 4500 },
  13: { facile: 1100, media: 2200, difficile: 3400, mortale: 5100 },
  14: { facile: 1250, media: 2500, difficile: 3800, mortale: 5700 },
  15: { facile: 1400, media: 2800, difficile: 4300, mortale: 6400 },
  16: { facile: 1600, media: 3200, difficile: 4800, mortale: 7200 },
  17: { facile: 2000, media: 3900, difficile: 5900, mortale: 8800 },
  18: { facile: 2100, media: 4200, difficile: 6300, mortale: 9500 },
  19: { facile: 2400, media: 4900, difficile: 7300, mortale: 10900 },
  20: { facile: 2800, media: 5700, difficile: 8500, mortale: 12700 },
};

// Moltiplicatore dei Punti Esperienza totali in base al numero di mostri coinvolti nello scontro.
function moltiplicatorePerNumeroMostri(numeroMostri, numeroGiocatori) {
  let m;
  if (numeroMostri <= 1) m = 1;
  else if (numeroMostri === 2) m = 1.5;
  else if (numeroMostri <= 6) m = 2;
  else if (numeroMostri <= 10) m = 2.5;
  else if (numeroMostri <= 14) m = 3;
  else m = 4;
  // Il moltiplicatore si sposta di una fascia se il gruppo e' piu' piccolo di 3 o piu' grande di 5 giocatori.
  const fasce = [1, 1.5, 2, 2.5, 3, 4];
  let idx = fasce.indexOf(m);
  if (numeroGiocatori < 3) idx = Math.min(fasce.length - 1, idx + 1);
  if (numeroGiocatori > 5) idx = Math.max(0, idx - 1);
  return fasce[idx];
}

export { SOGLIE_PE_PER_LIVELLO, moltiplicatorePerNumeroMostri };
