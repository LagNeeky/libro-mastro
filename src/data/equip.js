// Armi, armature e accessori ufficiali (5e 2014)

const SEMPLICI_BASE = ["barbaro", "bardo", "chierico", "druido", "guerriero", "ladro", "monaco", "paladino", "ranger", "warlock"];
const TUTTE_CLASSI_ARMA = ["barbaro", "bardo", "chierico", "druido", "guerriero", "ladro", "mago", "monaco", "paladino", "ranger", "stregone", "warlock"];
const MARZIALI_BASE = ["barbaro", "guerriero", "paladino", "ranger"];

const DEFAULT_WEAPONS = [
  { id: "pugnale", nome: "Pugnale", categoria: "mischia", danno: "1d4", tipoDanno: "perforanti", finesse: true, note: "Leggera, Finesse, Lanciabile (6/18m)", classi: TUTTE_CLASSI_ARMA },
  { id: "randello", nome: "Randello", categoria: "mischia", danno: "1d4", tipoDanno: "contundenti", finesse: false, note: "Leggera", classi: SEMPLICI_BASE },
  { id: "giavellotto", nome: "Giavellotto", categoria: "mischia", danno: "1d6", tipoDanno: "perforanti", finesse: false, note: "Lanciabile (9/36m)", classi: SEMPLICI_BASE },
  { id: "mazza", nome: "Mazza", categoria: "mischia", danno: "1d6", tipoDanno: "contundenti", finesse: false, note: "—", classi: SEMPLICI_BASE },
  { id: "falcetto", nome: "Falcetto", categoria: "mischia", danno: "1d4", tipoDanno: "taglienti", finesse: true, note: "Leggera, Finesse", classi: SEMPLICI_BASE },
  { id: "lancia", nome: "Lancia", categoria: "mischia", danno: "1d6", tipoDanno: "perforanti", finesse: false, note: "Versatile (1d8), Lanciabile (6/18m)", classi: SEMPLICI_BASE },
  { id: "bastone", nome: "Bastone", categoria: "mischia", danno: "1d6", tipoDanno: "contundenti", finesse: false, note: "Versatile (1d8)", classi: TUTTE_CLASSI_ARMA },
  { id: "frombola", nome: "Frombola", categoria: "distanza", danno: "1d4", tipoDanno: "contundenti", finesse: false, note: "Munizioni (9/36m)", classi: TUTTE_CLASSI_ARMA },
  { id: "spada_lunga", nome: "Spada lunga", categoria: "mischia", danno: "1d8", tipoDanno: "taglienti", finesse: false, note: "Versatile (1d10)", classi: [...MARZIALI_BASE, "bardo", "ladro"] },
  { id: "spada_corta", nome: "Spada corta", categoria: "mischia", danno: "1d6", tipoDanno: "perforanti", finesse: true, note: "Leggera, Finesse", classi: [...MARZIALI_BASE, "bardo", "ladro", "monaco"] },
  { id: "stocco", nome: "Stocco", categoria: "mischia", danno: "1d8", tipoDanno: "perforanti", finesse: true, note: "Finesse", classi: [...MARZIALI_BASE, "bardo", "ladro"] },
  { id: "scimitarra", nome: "Scimitarra", categoria: "mischia", danno: "1d6", tipoDanno: "taglienti", finesse: true, note: "Leggera, Finesse", classi: MARZIALI_BASE },
  { id: "ascia_bipenne", nome: "Ascia bipenne", categoria: "mischia", danno: "1d12", tipoDanno: "taglienti", finesse: false, note: "Pesante, Due mani", classi: MARZIALI_BASE },
  { id: "ascia_battaglia", nome: "Ascia da battaglia", categoria: "mischia", danno: "1d8", tipoDanno: "taglienti", finesse: false, note: "Versatile (1d10)", classi: MARZIALI_BASE },
  { id: "martello_guerra", nome: "Martello da guerra", categoria: "mischia", danno: "1d8", tipoDanno: "contundenti", finesse: false, note: "Versatile (1d10)", classi: MARZIALI_BASE },
  { id: "alabarda", nome: "Alabarda", categoria: "mischia", danno: "1d10", tipoDanno: "taglienti", finesse: false, note: "Pesante, Due mani, Portata", classi: MARZIALI_BASE },
  { id: "arco_corto", nome: "Arco corto", categoria: "distanza", danno: "1d6", tipoDanno: "perforanti", finesse: false, note: "Munizioni (24/96m), Due mani", classi: SEMPLICI_BASE },
  { id: "arco_lungo", nome: "Arco lungo", categoria: "distanza", danno: "1d8", tipoDanno: "perforanti", finesse: false, note: "Munizioni (45/180m), Pesante, Due mani", classi: MARZIALI_BASE },
  { id: "balestra_leggera", nome: "Balestra leggera", categoria: "distanza", danno: "1d8", tipoDanno: "perforanti", finesse: false, note: "Munizioni (24/96m), Caricamento, Due mani", classi: TUTTE_CLASSI_ARMA },
  { id: "balestra_pesante", nome: "Balestra pesante", categoria: "distanza", danno: "1d10", tipoDanno: "perforanti", finesse: false, note: "Munizioni (30/120m), Pesante, Caricamento, Due mani", classi: MARZIALI_BASE },
  { id: "balestra_mano", nome: "Balestra a mano", categoria: "distanza", danno: "1d6", tipoDanno: "perforanti", finesse: false, note: "Munizioni (9/36m), Leggera, Caricamento", classi: [...MARZIALI_BASE, "bardo", "ladro"] },
].map((w) => ({ ...w, rarita: "Comune", custom: false }));

const LEGGERE_BASE = ["barbaro", "bardo", "chierico", "druido", "guerriero", "ladro", "paladino", "ranger", "warlock"];
const MEDIE_BASE = ["barbaro", "chierico", "druido", "guerriero", "paladino", "ranger"];
const PESANTI_BASE = ["guerriero", "paladino"];

const DEFAULT_ARMORS = [
  { id: "imbottita", nome: "Armatura imbottita", tipo: "leggera", ca: 11, maxDex: null, forzaMin: null, classi: LEGGERE_BASE },
  { id: "cuoio", nome: "Cuoio", tipo: "leggera", ca: 11, maxDex: null, forzaMin: null, classi: LEGGERE_BASE },
  { id: "cuoio_borchiato", nome: "Cuoio borchiato", tipo: "leggera", ca: 12, maxDex: null, forzaMin: null, classi: LEGGERE_BASE },
  { id: "maglia", nome: "Camicia di maglia", tipo: "media", ca: 13, maxDex: 2, forzaMin: null, classi: MEDIE_BASE },
  { id: "corazza", nome: "Corazza", tipo: "media", ca: 14, maxDex: 2, forzaMin: null, classi: MEDIE_BASE },
  { id: "mezza_piastra", nome: "Mezza piastra", tipo: "media", ca: 15, maxDex: 2, forzaMin: null, classi: MEDIE_BASE },
  { id: "maglia_anelli", nome: "Maglia ad anelli", tipo: "pesante", ca: 14, maxDex: 0, forzaMin: null, classi: PESANTI_BASE },
  { id: "usbergo", nome: "Usbergo", tipo: "pesante", ca: 16, maxDex: 0, forzaMin: 13, classi: PESANTI_BASE },
  { id: "piastre", nome: "Armatura di piastre", tipo: "pesante", ca: 18, maxDex: 0, forzaMin: 15, classi: PESANTI_BASE },
].map((a) => ({ ...a, rarita: "Comune", custom: false }));

const DEFAULT_ACCESSORI = [
  // Comuni
  { id: "sacca_conservazione", nome: "Sacca di Conservazione", desc: "Ogni cibo non deperibile riposto al suo interno resta fresco per 6 mesi.", rarita: "Comune" },
  { id: "candela_invocazione", nome: "Candela dell'Invocazione", desc: "Se accesa, favorisce la magia di evocazione di un allineamento specifico nell'area circostante.", rarita: "Comune" },
  { id: "corno_ricognizione", nome: "Corno del Segnale", desc: "Se suonato, emette un suono udibile fino a 180 m; ogni corno ha un suono unico.", rarita: "Comune" },
  // Non Comuni
  { id: "borsa_infinita", nome: "Borsa Senza Fondo", desc: "Contenitore magico che può contenere un volume di oggetti molto superiore alle sue dimensioni esterne, senza aumentare di peso.", rarita: "Non Comune" },
  { id: "stivali_velocita", nome: "Stivali Ali del Vento", desc: "Attivabili per raddoppiare la velocità di movimento per un breve periodo.", rarita: "Non Comune" },
  { id: "stivali_scalata_libera", nome: "Stivali di Scalata Libera", desc: "Mentre indossati, hai velocità di scalata pari alla velocità normale e vantaggio alle prove di Atletica per arrampicarti.", rarita: "Non Comune" },
  { id: "mantello_protezione", nome: "Mantello Protettivo", desc: "+1 alla Classe Armatura e a tutti i Tiri Salvezza mentre indossato.", rarita: "Non Comune" },
  { id: "pozione_cura_ferite", nome: "Pozione di Cura Ferite", desc: "Bevendola, recuperi 2d4+2 Punti Ferita.", rarita: "Comune" },
  { id: "pozione_forza_gigante_collina", nome: "Pozione di Forza da Gigante delle Colline", desc: "Bevendola, la tua Forza diventa 21 per 1 ora, se non era già superiore.", rarita: "Non Comune" },
  { id: "pozione_invisibilita", nome: "Pozione di Invisibilità", desc: "Bevendola, diventi invisibile per 1 ora o finché non attacchi o lanci un incantesimo.", rarita: "Molto Raro" },
  { id: "pergamena_incantesimo", nome: "Pergamena Incantesimo", desc: "Contiene un incantesimo scritto che può essere letto per lanciarlo senza componenti materiali, indipendentemente dalla propria classe.", rarita: "Varia" },
  { id: "bacchetta_dardi_incantati", nome: "Bacchetta dei Dardi Incantati", desc: "Ha 7 cariche: puoi spenderne una o più per lanciare Dardo Incantato, potenziato in base alle cariche usate.", rarita: "Non Comune" },
  { id: "bacchetta_bersaglio_magico", nome: "Bacchetta del Bersaglio Magico", desc: "Ha 7 cariche: puoi spenderne una per ottenere un bonus al tiro per colpire con un attacco con incantesimo.", rarita: "Non Comune" },
  { id: "arma_piu_uno", nome: "Arma +1", desc: "Arma magica: +1 ai tiri per colpire e ai danni inflitti con essa.", rarita: "Non Comune" },
  { id: "armatura_piu_uno", nome: "Armatura +1", desc: "Armatura magica: +1 alla Classe Armatura mentre indossata.", rarita: "Raro" },
  { id: "elmo_telepatia", nome: "Elmo di Telepatia", desc: "Ti permette di comunicare telepaticamente con una creatura entro 9 metri e, con concentrazione, leggerne la mente.", rarita: "Non Comune" },
  { id: "guanti_destrezza", nome: "Guanti di Destrezza da Ladro", desc: "Vantaggio alle prove di Destrezza che richiedono manualità fine, come scassinare serrature o borseggiare.", rarita: "Raro" },
  { id: "occhiali_notte", nome: "Occhiali della Notte", desc: "Mentre indossati, ottieni Scurovisione fino a 18 m (o la estendi di 18 m se già la possiedi).", rarita: "Non Comune" },
  // Rari
  { id: "anello_protezione", nome: "Anello di Protezione", desc: "Anello magico che dona +1 alla Classe Armatura e a tutti i Tiri Salvezza mentre indossato.", rarita: "Raro" },
  { id: "amuleto_salute", nome: "Amuleto della Salute", desc: "La Costituzione di chi lo indossa diventa 19, se non è già superiore.", rarita: "Raro" },
  { id: "bracciali_difesa", nome: "Bracciali di Difesa", desc: "+2 alla Classe Armatura se non si indossa armatura né scudo.", rarita: "Raro" },
  { id: "mantello_elfico", nome: "Mantello Elfico", desc: "Dona vantaggio alle prove di Furtività mentre il cappuccio è alzato.", rarita: "Raro" },
  { id: "anello_resistenza", nome: "Anello di Resistenza", desc: "Resistenza a un tipo di danno specifico mentre indossato.", rarita: "Raro" },
  { id: "arma_piu_due", nome: "Arma +2", desc: "Arma magica: +2 ai tiri per colpire e ai danni inflitti con essa.", rarita: "Raro" },
  { id: "armatura_piu_due", nome: "Armatura +2", desc: "Armatura magica: +2 alla Classe Armatura mentre indossata.", rarita: "Molto Raro" },
  { id: "scudo_piu_uno", nome: "Scudo +1", desc: "Scudo magico: +1 aggiuntivo alla Classe Armatura oltre al normale bonus dello scudo.", rarita: "Raro" },
  { id: "bastone_guarigione", nome: "Bastone di Guarigione", desc: "Ha 10 cariche: puoi spenderle per lanciare incantesimi di cura come Cura Ferite o Parola Guaritrice senza componenti materiali.", rarita: "Raro" },
  { id: "sfera_cristallo", nome: "Sfera di Cristallo", desc: "Ti permette di lanciare Scrutare senza componenti materiali, concentrandoti su di essa.", rarita: "Molto Raro" },
  { id: "tappeto_volante", nome: "Tappeto Volante", desc: "Vola alla tua guida vocale, trasportando te e altri passeggeri secondo le sue dimensioni.", rarita: "Molto Raro" },
  { id: "corno_valhalla", nome: "Corno di Valhalla (Argento)", desc: "Se soffiato, evoca spiriti guerrieri che combattono al tuo fianco per un breve periodo.", rarita: "Raro" },
  // Molto Rari
  { id: "cintura_gigante_nuvola", nome: "Cintura da Gigante delle Nuvole", desc: "Mentre indossata, la tua Forza diventa 27, se non era già superiore.", rarita: "Molto Raro" },
  { id: "manto_ali_pipistrello", nome: "Manto delle Ali di Pipistrello", desc: "Ti trasformi in pipistrello con azione, ottenendo velocità di volo, e torni normale a piacere.", rarita: "Non Comune" },
  { id: "arma_piu_tre", nome: "Arma +3", desc: "Arma magica: +3 ai tiri per colpire e ai danni inflitti con essa.", rarita: "Molto Raro" },
  { id: "armatura_piu_tre", nome: "Armatura +3", desc: "Armatura magica: +3 alla Classe Armatura mentre indossata.", rarita: "Leggendario" },
  { id: "bastone_potere", nome: "Bastone del Potere", desc: "Ha 20 cariche: potenzia i tuoi tiri per colpire e le CD dei tuoi incantesimi, oltre a permetterti di lanciare incantesimi comuni di attacco.", rarita: "Molto Raro" },
  { id: "pietra_dialogo", nome: "Pietra del Dialogo Mentale", desc: "Un set di gemme abbinate che permette comunicazione telepatica a distanza tra chi le porta.", rarita: "Molto Raro" },
  { id: "sfera_annientamento", nome: "Sfera d'Annientamento", desc: "Una sfera di oscurità totale che distrugge ogni materia con cui entra in contatto, controllabile con concentrazione.", rarita: "Leggendario" },
  // Leggendari e Artefatti
  { id: "vorpal", nome: "Spada Vorpal", desc: "Arma +3: con un tiro per colpire naturale di 20 contro una creatura con testa, le tronchi la testa se non è immune.", rarita: "Leggendario" },
  { id: "bastone_arcomagia", nome: "Bastone dell'Arcimagia", desc: "Bastone supremo che potenzia enormemente gli incantesimi e le CD del suo possessore incantatore.", rarita: "Leggendario" },
  { id: "libro_incantesimi_eccellenza", nome: "Manuale della Perfezione Fisica", desc: "Tomo magico che, se studiato per un mese, aumenta permanentemente una caratteristica fisica.", rarita: "Molto Raro" },
].map((a) => ({ ...a, custom: false }));


export { DEFAULT_WEAPONS, DEFAULT_ARMORS, DEFAULT_ACCESSORI };
