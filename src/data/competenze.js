// Competenze generiche (strumenti, kit, veicoli) del Manuale del Giocatore

const DEFAULT_COMPETENZE_GENERICHE = [
  // Strumenti da Artigiano
  { id: "attrezzi_alchimista", nome: "Attrezzi da Alchimista", categoria: "Strumenti da Artigiano" },
  { id: "attrezzi_birraio", nome: "Attrezzi da Birraio", categoria: "Strumenti da Artigiano" },
  { id: "attrezzi_calligrafo", nome: "Attrezzi da Calligrafo", categoria: "Strumenti da Artigiano" },
  { id: "attrezzi_falegname", nome: "Attrezzi da Falegname", categoria: "Strumenti da Artigiano" },
  { id: "attrezzi_cartografo", nome: "Attrezzi da Cartografo", categoria: "Strumenti da Artigiano" },
  { id: "attrezzi_calzolaio", nome: "Attrezzi da Calzolaio", categoria: "Strumenti da Artigiano" },
  { id: "attrezzi_cuoco", nome: "Attrezzi da Cuoco", categoria: "Strumenti da Artigiano" },
  { id: "attrezzi_vetraio", nome: "Attrezzi da Vetraio", categoria: "Strumenti da Artigiano" },
  { id: "attrezzi_gioielliere", nome: "Attrezzi da Gioielliere", categoria: "Strumenti da Artigiano" },
  { id: "attrezzi_conciatore", nome: "Attrezzi da Conciatore", categoria: "Strumenti da Artigiano" },
  { id: "attrezzi_muratore", nome: "Attrezzi da Muratore", categoria: "Strumenti da Artigiano" },
  { id: "attrezzi_pittore", nome: "Attrezzi da Pittore", categoria: "Strumenti da Artigiano" },
  { id: "attrezzi_vasaio", nome: "Attrezzi da Vasaio", categoria: "Strumenti da Artigiano" },
  { id: "attrezzi_fabbro", nome: "Attrezzi da Fabbro", categoria: "Strumenti da Artigiano" },
  { id: "attrezzi_meccanico", nome: "Attrezzi da Meccanico", categoria: "Strumenti da Artigiano" },
  { id: "telaio_tessitore", nome: "Telaio da Tessitore", categoria: "Strumenti da Artigiano" },
  { id: "attrezzi_intagliatore", nome: "Attrezzi da Intagliatore", categoria: "Strumenti da Artigiano" },
  // Kit speciali
  { id: "kit_travestimento", nome: "Kit da Travestimento", categoria: "Kit Speciali" },
  { id: "kit_falsario", nome: "Kit da Falsario", categoria: "Kit Speciali" },
  { id: "kit_erborista", nome: "Kit da Erborista", categoria: "Kit Speciali" },
  { id: "attrezzi_navigatore", nome: "Attrezzi da Navigatore", categoria: "Kit Speciali" },
  { id: "kit_avvelenatore", nome: "Kit da Avvelenatore", categoria: "Kit Speciali" },
  { id: "kit_scasso", nome: "Kit da Scasso (Strumenti da Ladro)", categoria: "Kit Speciali" },
  // Giochi e Strumenti Musicali
  { id: "set_gioco", nome: "Set da Gioco (a scelta)", categoria: "Giochi e Musica" },
  { id: "strumento_musicale", nome: "Strumento Musicale (a scelta)", categoria: "Giochi e Musica" },
  // Veicoli
  { id: "veicoli_terrestri", nome: "Veicoli (Terrestri)", categoria: "Veicoli" },
  { id: "veicoli_acquatici", nome: "Veicoli (Acquatici)", categoria: "Veicoli" },
].map((c) => ({ ...c, custom: false }));

export { DEFAULT_COMPETENZE_GENERICHE };
