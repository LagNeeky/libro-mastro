// Infusioni dell'Artificiere (privilegio di classe "Infondere Oggetti", comune a tutte le sottoclassi)

const DEFAULT_INFUSIONI = [
  { id: "arma_potenziata", nome: "Arma Potenziata", livelloMin: 2, oggetto: "Un'arma semplice o marziale", desc: "L'arma infusa dona +1 ai tiri per colpire e ai danni inflitti con essa." },
  { id: "difesa_potenziata", nome: "Difesa Potenziata", livelloMin: 2, oggetto: "Un'armatura o uno scudo", desc: "Dona +1 alla Classe Armatura mentre indossata o impugnato." },
  { id: "servitore_homunculus", nome: "Servitore Homunculus", livelloMin: 2, oggetto: "Un pugno di componenti varie (si consumano nella creazione)", desc: "Crei un piccolo servitore costrutto senziente e volante, legato a te, capace di attaccare, osservare al posto tuo e parlare una lingua a tua scelta." },
  { id: "zaino_rampicante", nome: "Zaino Rampicante", livelloMin: 2, oggetto: "Uno zaino", desc: "Chi lo indossa ottiene velocità di scalata pari alla propria velocità normale." },
  { id: "lente_rivelazione", nome: "Lente della Rivelazione", livelloMin: 2, oggetto: "Una lente o un paio di occhiali", desc: "Chi la indossa ha vantaggio alle prove per notare scritte nascoste, messaggi cifrati e per individuare la magia." },
  { id: "stivali_falcata_fluviale", nome: "Stivali della Falcata Fluviale", livelloMin: 2, oggetto: "Un paio di stivali", desc: "Chi li indossa può camminare sulla superficie di liquidi come se fossero terreno solido." },
  { id: "sacca_conservante_infusa", nome: "Sacca Conservante", livelloMin: 2, oggetto: "Un piccolo contenitore con coperchio", desc: "Il cibo non deperibile riposto al suo interno resta fresco per 6 mesi." },
  { id: "guanto_radioso", nome: "Guanto Radioso", livelloMin: 2, oggetto: "Un paio di guanti", desc: "Chi li indossa può far emettere luce intensa alla propria mano come azione bonus, illuminando l'area circostante." },
  { id: "fiala_risveglio", nome: "Fiala Alchemica del Risveglio", livelloMin: 2, oggetto: "Un seme o piccolo bulbo", desc: "Se piantato, dopo 30 giorni germoglia in un piccolo servitore vegetale amichevole legato a te." },
  { id: "anello_salto_radioso", nome: "Anello del Salto Radioso", livelloMin: 2, oggetto: "Un anello", desc: "Chi lo indossa ottiene un forte bonus alla distanza dei salti in lungo e in alto." },
  { id: "specchio_ritorno", nome: "Specchio del Ritorno", livelloMin: 2, oggetto: "Uno specchietto tascabile", desc: "Permette di comunicare brevemente con un secondo specchio gemello, se entrambi sono sullo stesso piano." },
  { id: "stivali_sentiero_tortuoso", nome: "Stivali del Sentiero Tortuoso", livelloMin: 6, oggetto: "Un paio di stivali", desc: "Chi li indossa può teletrasportarsi fino a 4,5 m come azione bonus, verso uno spazio libero che ha occupato in quel turno." },
  { id: "manto_resistenza_infuso", nome: "Manto Ripiegabile", livelloMin: 6, oggetto: "Un indumento indossabile", desc: "Dona resistenza a un tipo di danno a tua scelta (deciso alla creazione dell'infusione)." },
  { id: "fascia_percezione", nome: "Fascia della Percezione Acuta", livelloMin: 6, oggetto: "Una fascia o un copricapo", desc: "Chi la indossa ottiene Scurovisione 18 m, o la estende di 18 m se già la possiede." },
  { id: "otre_respirazione", nome: "Otre della Respirazione", livelloMin: 6, oggetto: "Un piccolo otre o maschera", desc: "Chi lo porta con sé può respirare sott'acqua e comunicare con creature acquatiche tramite semplici gesti." },
  { id: "bacchetta_mago_guerra", nome: "Bacchetta del Mago di Guerra", livelloMin: 10, oggetto: "Una bacchetta", desc: "Chi la usa come focus arcano ottiene +1 ai tiri per colpire con incantesimo (+2 dal 14° livello da Artificiere)." },
  { id: "strumento_potenziato", nome: "Strumento Potenziato", livelloMin: 10, oggetto: "Un set di strumenti da artigiano", desc: "Chi lo usa ottiene un bonus alle prove di caratteristica effettuate con esso, pari al tuo modificatore di Intelligenza (minimo +1)." },
  { id: "scudo_ripulsione", nome: "Scudo di Repulsione", livelloMin: 10, oggetto: "Uno scudo", desc: "Come reazione a un attacco in mischia subito mentre lo si impugna, si può spingere l'attaccante fino a 4,5 m di distanza." },
  { id: "armatura_propulsione_arcana", nome: "Armatura di Propulsione Arcana", livelloMin: 14, oggetto: "Una tuta di armatura pesante", desc: "Dona +1,5 m di velocità, guanti che fungono da armi da mischia magiche e possono essere lanciati per poi tornare alla mano, e altri potenziamenti significativi." },
].map((i) => ({ ...i, custom: false }));

export { DEFAULT_INFUSIONI };
