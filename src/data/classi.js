// Classi e sottoclassi ufficiali del Manuale del Giocatore (5e 2014)

const DEFAULT_CLASSI = [
  { id: "barbaro", nome: "Barbaro", dado: 12, tiri: ["FOR", "COS"], caster: null, progressione: "nessuno", compEquip: { armature: { leggera: true, media: true, pesante: false }, scudi: true, armi: { improvvisata: false, semplice: true, daGuerra: true } }, tratti: [{ nome: "Ira", desc: "Bonus ai danni in mischia e resistenza ai danni fisici per un breve periodo, un numero limitato di volte al giorno." }] },
  { id: "bardo", nome: "Bardo", dado: 8, tiri: ["DES", "CAR"], caster: "CAR", progressione: "pieno", compEquip: { armature: { leggera: true, media: false, pesante: false }, scudi: false, armi: { improvvisata: false, semplice: true, daGuerra: false } }, tratti: [{ nome: "Ispirazione Bardica", desc: "Doni un dado bonus a un alleato per un tiro a sua scelta." }] },
  { id: "chierico", nome: "Chierico", dado: 8, tiri: ["SAG", "CAR"], caster: "SAG", progressione: "pieno", compEquip: { armature: { leggera: true, media: true, pesante: false }, scudi: true, armi: { improvvisata: false, semplice: true, daGuerra: false } }, tratti: [{ nome: "Incanalare Divinità", desc: "Attinge al potere divino per effetti speciali legati al proprio Dominio." }] },
  { id: "druido", nome: "Druido", dado: 8, tiri: ["INT", "SAG"], caster: "SAG", progressione: "pieno", compEquip: { armature: { leggera: true, media: true, pesante: false }, scudi: true, armi: { improvvisata: false, semplice: true, daGuerra: false } }, tratti: [{ nome: "Forma Selvatica", desc: "Puoi trasformarti in una creatura bestiale già incontrata." }] },
  { id: "guerriero", nome: "Guerriero", dado: 10, tiri: ["FOR", "COS"], caster: null, progressione: "nessuno", compEquip: { armature: { leggera: true, media: true, pesante: true }, scudi: true, armi: { improvvisata: false, semplice: true, daGuerra: true } }, tratti: [{ nome: "Stile di Combattimento", desc: "Scegli una specializzazione tattica permanente in battaglia." }] },
  { id: "ladro", nome: "Ladro", dado: 8, tiri: ["DES", "INT"], caster: null, progressione: "nessuno", compEquip: { armature: { leggera: true, media: false, pesante: false }, scudi: false, armi: { improvvisata: false, semplice: true, daGuerra: false } }, tratti: [{ nome: "Attacco Furtivo", desc: "Danno bonus quando colpisci con vantaggio o un alleato è vicino al bersaglio." }] },
  { id: "mago", nome: "Mago", dado: 6, tiri: ["INT", "SAG"], caster: "INT", progressione: "pieno", compEquip: { armature: { leggera: false, media: false, pesante: false }, scudi: false, armi: { improvvisata: false, semplice: true, daGuerra: false } }, tratti: [{ nome: "Recupero Arcano", desc: "Recuperi alcuni slot incantesimo con un breve riposo, una volta al giorno." }] },
  { id: "monaco", nome: "Monaco", dado: 8, tiri: ["FOR", "DES"], caster: null, progressione: "nessuno", compEquip: { armature: { leggera: false, media: false, pesante: false }, scudi: false, armi: { improvvisata: false, semplice: true, daGuerra: false } }, tratti: [{ nome: "Ki", desc: "Punti energia spendibili per tecniche marziali speciali." }] },
  { id: "paladino", nome: "Paladino", dado: 10, tiri: ["SAG", "CAR"], caster: "CAR", progressione: "mezzo", compEquip: { armature: { leggera: true, media: true, pesante: true }, scudi: true, armi: { improvvisata: false, semplice: true, daGuerra: true } }, tratti: [{ nome: "Imposizione delle Mani", desc: "Riserva di cura a contatto usabile a piacere." }] },
  { id: "ranger", nome: "Ranger", dado: 10, tiri: ["FOR", "DES"], caster: "SAG", progressione: "mezzo", compEquip: { armature: { leggera: true, media: true, pesante: false }, scudi: true, armi: { improvvisata: false, semplice: true, daGuerra: true } }, tratti: [{ nome: "Nemico Prescelto", desc: "Bonus contro un tipo di creatura scelto." }] },
  { id: "stregone", nome: "Stregone", dado: 6, tiri: ["COS", "CAR"], caster: "CAR", progressione: "pieno", compEquip: { armature: { leggera: false, media: false, pesante: false }, scudi: false, armi: { improvvisata: false, semplice: true, daGuerra: false } }, tratti: [{ nome: "Punti Stregoneria", desc: "Riserva di energia magica per plasmare gli incantesimi in modi speciali." }] },
  { id: "warlock", nome: "Warlock", dado: 8, tiri: ["SAG", "CAR"], caster: "CAR", progressione: "pieno", compEquip: { armature: { leggera: true, media: false, pesante: false }, scudi: false, armi: { improvvisata: false, semplice: true, daGuerra: false } }, tratti: [{ nome: "Patto Magico", desc: "Un beneficio speciale concesso dal tuo patrono, secondo il Patto scelto." }] },
].map((c) => ({ ...c, custom: false }));

const DEFAULT_SOTTOCLASSI = [
  { id: "campione", classeId: "guerriero", nome: "Campione", tratti: [{ nome: "Critico Migliorato", desc: "Ottieni un colpo critico anche con un 19 naturale al tiro per colpire." }] },
  { id: "scuola_invocazione", classeId: "mago", nome: "Scuola di Invocazione", tratti: [{ nome: "Studioso dell'Invocazione", desc: "Riduzione di costo e potenziamento dei tuoi incantesimi di Invocazione." }] },
  { id: "ladro_archetipo", classeId: "ladro", nome: "Ladro", tratti: [{ nome: "Mani Rapide", desc: "Puoi usare l'azione bonus di Azione Scaltra per compiere ulteriori azioni furtive." }] },
  { id: "dominio_vita", classeId: "chierico", nome: "Dominio della Vita", tratti: [{ nome: "Disco Divino", desc: "I tuoi incantesimi di cura ripristinano PF aggiuntivi." }] },
  { id: "berserker", classeId: "barbaro", nome: "Berserker", tratti: [{ nome: "Ira Frenetica", desc: "In Ira puoi effettuare un attacco extra come azione bonus, a costo di un po' di stanchezza." }] },
  { id: "collegio_sapienza", classeId: "bardo", nome: "Collegio dei Saggi", tratti: [{ nome: "Taglienti Parole", desc: "Usi la tua eloquenza per minare le difese mentali di un nemico." }] },
  { id: "circolo_terra", classeId: "druido", nome: "Circolo della Terra", tratti: [{ nome: "Incantesimi Bonus del Circolo", desc: "Incantesimi extra sempre pronti in base al tuo terreno d'elezione." }] },
  { id: "mano_aperta", classeId: "monaco", nome: "Via della Mano Aperta", tratti: [{ nome: "Tecnica della Mano Aperta", desc: "I tuoi attacchi con Raffica di Colpi possono spingere, stordire o far cadere il bersaglio." }] },
  { id: "giuramento_devozione", classeId: "paladino", nome: "Giuramento di Devozione", tratti: [{ nome: "Sacra Arma", desc: "Puoi imbuire un'arma di luce sacra per un breve periodo." }] },
  { id: "cacciatore", classeId: "ranger", nome: "Cacciatore", tratti: [{ nome: "Preda Prescelta", desc: "Scegli una tattica specializzata contro certi tipi di nemici o gruppi numerosi." }] },
  { id: "sangue_draconico", classeId: "stregone", nome: "Linea di Sangue Draconica", tratti: [{ nome: "Resilienza Draconica", desc: "PF massimi aumentati e CA naturale migliorata senza armatura." }] },
  { id: "patrono_immondo", classeId: "warlock", nome: "Patrono Immondo", tratti: [{ nome: "Resistenza Oscura", desc: "Resistenza ai danni da fuoco e PF temporanei bonus salendo di livello." }] },
  // --- Barbaro ---
  { id: "totem_guerriero", classeId: "barbaro", nome: "Totem Guerriero", tratti: [{ nome: "Spirito Totemico", desc: "Scegli uno spirito animale (Orso, Aquila o Lupo) che ti dona un beneficio mistico mentre sei in Ira." }] },
  // --- Bardo ---
  { id: "collegio_valore", classeId: "bardo", nome: "Collegio del Valore", tratti: [{ nome: "Ispirazione in Combattimento", desc: "Chi riceve la tua Ispirazione Bardica può usarla per migliorare un tiro per colpire, un danno o la CA." }] },
  // --- Chierico (Domini) ---
  { id: "dominio_conoscenza", classeId: "chierico", nome: "Dominio della Conoscenza", tratti: [{ nome: "Benedizioni del Sapiente", desc: "Competenza aggiuntiva in due abilità e raddoppio del bonus di competenza su di esse." }] },
  { id: "dominio_luce", classeId: "chierico", nome: "Dominio della Luce", tratti: [{ nome: "Fiamma dell'Aurora", desc: "Incantesimo Fiamme Sacre bonus e capacità di irradiare luce accecante." }] },
  { id: "dominio_natura", classeId: "chierico", nome: "Dominio della Natura", tratti: [{ nome: "Discepolo della Natura", desc: "Competenza aggiuntiva con un'arma marziale e con le armature pesanti." }] },
  { id: "dominio_tempesta", classeId: "chierico", nome: "Dominio della Tempesta", tratti: [{ nome: "Ira della Tempesta", desc: "Quando subisci danno da un attacco in mischia, puoi infliggere danno da fulmine o tuono all'attaccante." }] },
  { id: "dominio_inganno", classeId: "chierico", nome: "Dominio dell'Inganno", tratti: [{ nome: "Benedizione dell'Ingannatore", desc: "Insegni a un'altra creatura il trucchetto Illusione Minore." }] },
  { id: "dominio_guerra", classeId: "chierico", nome: "Dominio della Guerra", tratti: [{ nome: "Sacerdote Guerriero", desc: "Competenza con le armi marziali e con le armature pesanti." }] },
  // --- Druido ---
  { id: "circolo_luna", classeId: "druido", nome: "Circolo della Luna", tratti: [{ nome: "Forma Selvatica da Combattimento", desc: "Puoi trasformarti in creature bestiali più pericolose e usare la Forma Selvatica come azione bonus." }] },
  // --- Guerriero ---
  { id: "maestro_di_battaglia", classeId: "guerriero", nome: "Maestro di Battaglia", tratti: [{ nome: "Manovre di Combattimento", desc: "Impari manovre tattiche speciali alimentate da Dadi Superiorità." }] },
  { id: "cavaliere_magico", classeId: "guerriero", nome: "Cavaliere Magico", tratti: [{ nome: "Lancio di Incantesimi", desc: "Impari a lanciare incantesimi da Mago, principalmente di Invocazione e Abiurazione." }] },
  // --- Ladro ---
  { id: "assassino", classeId: "ladro", nome: "Assassino", tratti: [{ nome: "Colpo Fatale", desc: "Vantaggio automatico contro creature che non hanno ancora agito, e ogni colpo a segno su un bersaglio colto di sorpresa è un critico." }] },
  { id: "trickster_arcano", classeId: "ladro", nome: "Trickster Arcano", tratti: [{ nome: "Incantesimi Illusori e di Ammaliamento", desc: "Impari a lanciare incantesimi da Mago, principalmente di Illusione e Ammaliamento." }] },
  // --- Monaco ---
  { id: "via_ombra", classeId: "monaco", nome: "Via dell'Ombra", tratti: [{ nome: "Arti dell'Ombra", desc: "Puoi spendere punti Ki per lanciare Oscurità, Silenzio o Passo Velato, e teletrasportarti tra le ombre." }] },
  { id: "via_quattro_elementi", classeId: "monaco", nome: "Via dei Quattro Elementi", tratti: [{ nome: "Discipline Elementali", desc: "Spendi punti Ki per scatenare effetti simili a incantesimi che imitano il controllo dei quattro elementi." }] },
  // --- Paladino ---
  { id: "giuramento_antichi", classeId: "paladino", nome: "Giuramento degli Antichi", tratti: [{ nome: "Luce della Natura", desc: "Incantesimi legati alla natura e capacità di creare un'aura di luce curativa contro le tenebre." }] },
  { id: "giuramento_vendetta", classeId: "paladino", nome: "Giuramento di Vendetta", tratti: [{ nome: "Nemico Giurato", desc: "Puoi marcare una creatura come bersaglio, ottenendo vantaggio nel darle la caccia." }] },
  // --- Ranger ---
  { id: "maestro_bestie", classeId: "ranger", nome: "Maestro delle Bestie", tratti: [{ nome: "Compagno Animale", desc: "Una bestia ti accompagna in battaglia e agisce secondo i tuoi comandi." }] },
  // --- Stregone ---
  { id: "magia_selvaggia", classeId: "stregone", nome: "Magia Selvaggia", tratti: [{ nome: "Ondata di Magia Selvaggia", desc: "Dopo aver lanciato un incantesimo, puoi generare un effetto magico casuale e imprevedibile." }] },
  // --- Warlock ---
  { id: "patrono_arcana_fata", classeId: "warlock", nome: "Arcana Fata", tratti: [{ nome: "Passo Fatato", desc: "Puoi teletrasportarti a breve distanza come azione bonus, un numero limitato di volte al giorno." }] },
  { id: "grande_antico", classeId: "warlock", nome: "Grande Antico", tratti: [{ nome: "Sussurri Alieni", desc: "Conosci il trucchetto Contatto Telepatico e puoi terrorizzare una mente con un tocco." }] },
  // --- Mago (Scuole) ---
  { id: "scuola_ammaliamento", classeId: "mago", nome: "Scuola di Ammaliamento", tratti: [{ nome: "Presa Ipnotica", desc: "Puoi ammaliare una creatura umanoide toccandola, senza componenti materiali." }] },
  { id: "scuola_congiurazione", classeId: "mago", nome: "Scuola di Congiurazione", tratti: [{ nome: "Sapienza del Minore Congiurato", desc: "Puoi evocare una piccola scorta di provviste o un familiare a distanza usando un'azione bonus." }] },
  { id: "scuola_divinazione", classeId: "mago", nome: "Scuola di Divinazione", tratti: [{ nome: "Portento", desc: "Puoi sostituire un tiro con un dado predeterminato in anticipo, un numero limitato di volte al giorno." }] },
  { id: "scuola_illusione", classeId: "mago", nome: "Scuola di Illusione", tratti: [{ nome: "Illusione Migliorata", desc: "Puoi lanciare Immagine Silenziosa spendendo solo un'azione bonus, o rendere permanenti alcune illusioni." }] },
  { id: "scuola_necromanzia", classeId: "mago", nome: "Scuola di Necromanzia", tratti: [{ nome: "Padronanza dei Non Morti", desc: "Puoi controllare più non morti del normale quando li animi con i tuoi incantesimi." }] },
  { id: "scuola_trasmutazione", classeId: "mago", nome: "Scuola di Trasmutazione", tratti: [{ nome: "Pietra del Trasmutatore", desc: "Crei una pietra magica che ti dona benefici speciali finché la porti con te." }] },
  { id: "scuola_abiurazione", classeId: "mago", nome: "Scuola di Abiurazione", tratti: [{ nome: "Scudo Arcano", desc: "Quando lanci un incantesimo di Abiurazione, crei uno scudo magico che assorbe danni." }] },
].map((s) => ({ ...s, custom: false }));


export { DEFAULT_CLASSI, DEFAULT_SOTTOCLASSI };
