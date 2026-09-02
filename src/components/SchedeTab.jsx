import React, { useState, useMemo, useRef } from 'react';
import { styles, palette } from '../styles.js';
import { ABILITIES, ABILITY_LABELS, mod, fmt, zeroBonus, uid, PROF_BONUS_BY_LEVEL, nomeFonte, APPLICA_A_OPTIONS, MAGICO_OPTIONS, RARITA_OPTIONS, POSIZIONE_OPTIONS, TIPO_DANNO_OPTIONS } from '../utils/helpers.js';
import { TABELLA_SLOT_PIENI, TABELLA_PATTO_WARLOCK, puntiStregoneriaPerLivello, TERZO_CASTER_SOTTOCLASSI, BARDO_CONOSCIUTI, RANGER_CONOSCIUTI, STREGONE_CONOSCIUTI, WARLOCK_CONOSCIUTI, TERZO_CASTER_CONOSCIUTI } from '../utils/spellSlots.js';
import { ComboInput, NumInput, AutoTextarea, StatBox, SearchAddRow } from './shared.jsx';


function SchedeTab({ personaggi, attivoId, setAttivoId, aggiungiPg, rimuoviPg, pg, updatePg, skills, setSkills, razze, sottorazze, classi, sottoclassi, armi, armature, accessori, incantesimi, competenzeGenericheCatalogo, setCompetenzeGenericheCatalogo, infusioniCatalogo, regoleOpzionali, openD20Roll, openDiceRoll, openDetail, onEsportaPg, onImportaPg }) {
  const razza = razze.find((r) => r.id === pg.razzaId);
  const sottorazza = sottorazze.find((s) => s.id === pg.sottorazzaId);
  const razzaBonus = razza?.bonus || zeroBonus();
  const sottorazzaBonus = sottorazza?.bonus || zeroBonus();

  const modByAb = useMemo(() => {
    const m = {};
    ABILITIES.forEach((a) => { m[a] = mod(pg.abilita[a] + (razzaBonus[a] || 0) + (sottorazzaBonus[a] || 0)); });
    return m;
  }, [pg.abilita, pg.razzaId, pg.sottorazzaId]);

  const livelloTotale = pg.classi.reduce((s, c) => s + Number(c.livello || 0), 0) || 1;
  const profBonus = PROF_BONUS_BY_LEVEL(livelloTotale);
  const classePrimaria = classi.find((c) => c.id === pg.classi[0]?.classeId);
  const classiIncantatriciBase = pg.classi
    .map((ce) => classi.find((c) => c.id === ce.classeId))
    .filter((c) => c && c.caster)
    .filter((c, idx, arr) => arr.findIndex((x) => x.id === c.id) === idx);
  const classiTerzoCaster = pg.classi
    .filter((ce) => TERZO_CASTER_SOTTOCLASSI.includes(ce.sottoclasseId))
    .map((ce) => { const c = classi.find((x) => x.id === ce.classeId); const sc = sottoclassi.find((x) => x.id === ce.sottoclasseId); return c ? { id: `${c.id}_terzo`, nome: `${c.nome} (${sc ? sc.nome : "incantatore a un terzo"})`, caster: "INT" } : null; })
    .filter(Boolean);
  const classiIncantatrici = [...classiIncantatriciBase, ...classiTerzoCaster];

  const bonusExtra = (tipo) => [...pg.trattiRazziali, ...pg.privilegiClasse, ...pg.talenti].filter((e) => e.applicaA === tipo).reduce((s, e) => s + Number(e.valore || 0), 0);

  const armaturaEquipRef = pg.armaturePossedute.find((x) => x.instId === pg.armaturaIndossataInstId);
  const armaturaEquipBase = armaturaEquipRef ? armature.find((a) => a.id === armaturaEquipRef.refId) : null;
  const armaturaEquip = useMemo(() => {
    if (!armaturaEquipBase) return null;
    const ca = armaturaEquipRef.caOverride !== null && armaturaEquipRef.caOverride !== undefined && armaturaEquipRef.caOverride !== "" ? Number(armaturaEquipRef.caOverride) : armaturaEquipBase.ca;
    const maxDex = armaturaEquipRef.maxDexOverride !== null && armaturaEquipRef.maxDexOverride !== undefined && armaturaEquipRef.maxDexOverride !== "" ? Number(armaturaEquipRef.maxDexOverride) : armaturaEquipBase.maxDex;
    const forzaMin = armaturaEquipRef.forzaMinOverride !== null && armaturaEquipRef.forzaMinOverride !== undefined && armaturaEquipRef.forzaMinOverride !== "" ? Number(armaturaEquipRef.forzaMinOverride) : armaturaEquipBase.forzaMin;
    return { ...armaturaEquipBase, ca, maxDex, forzaMin };
  }, [armaturaEquipBase, armaturaEquipRef?.caOverride, armaturaEquipRef?.maxDexOverride, armaturaEquipRef?.forzaMinOverride]);
  const caCalcolata = useMemo(() => {
    if (pg.caOverride !== null && pg.caOverride !== undefined && pg.caOverride !== "") return Number(pg.caOverride);
    let base = 10 + modByAb.DES;
    if (armaturaEquip) {
      let capDes;
      if (armaturaEquip.maxDex === null) capDes = modByAb.DES; // leggera: bonus di Destrezza pieno, positivo o negativo
      else if (armaturaEquip.maxDex === 0) capDes = 0; // pesante: la Destrezza non si applica mai, nemmeno se negativa
      else capDes = Math.min(modByAb.DES, armaturaEquip.maxDex); // media: bonus limitato al tetto, ma un malus negativo si applica comunque per intero
      base = armaturaEquip.ca + capDes;
    }
    if (pg.scudo) base += 2;
    return base + bonusExtra("CA");
  }, [pg.caOverride, pg.scudo, armaturaEquip, modByAb.DES, pg.trattiRazziali, pg.privilegiClasse]);

  const dadiVitaPerTipo = useMemo(() => {
    const map = {};
    pg.classi.forEach((ce) => {
      const c = classi.find((x) => x.id === ce.classeId);
      if (!c) return;
      const lvl = Number(ce.livello) || 0;
      map[c.dado] = (map[c.dado] || 0) + lvl;
    });
    return map;
  }, [pg.classi, classi]);

  const incantesimiPreparatiConosciuti = useMemo(() => {
    let totale = 0;
    const dettaglio = [];
    pg.classi.forEach((ce) => {
      const c = classi.find((x) => x.id === ce.classeId);
      if (!c) return;
      const lvl = Math.min(20, Number(ce.livello) || 0);
      if (!lvl || lvl <= 0) return;
      const isTerzoCaster = TERZO_CASTER_SOTTOCLASSI.includes(ce.sottoclasseId);
      let n = 0;
      if (c.id === "chierico" || c.id === "druido") { n = Math.max(1, modByAb.SAG + lvl); dettaglio.push(`${c.nome}: Saggezza (${fmt(modByAb.SAG)}) + livello (${lvl}) = ${n}`); }
      else if (c.id === "paladino") { n = Math.max(1, modByAb.CAR + Math.floor(lvl / 2)); dettaglio.push(`${c.nome}: Carisma (${fmt(modByAb.CAR)}) + metà livello (${Math.floor(lvl / 2)}) = ${n}`); }
      else if (c.id === "mago") { n = Math.max(1, modByAb.INT + lvl); dettaglio.push(`${c.nome}: Intelligenza (${fmt(modByAb.INT)}) + livello (${lvl}) = ${n} (nel libro degli incantesimi possono essercene molti di più)`); }
      else if (c.id === "artificiere") { n = Math.max(1, modByAb.INT + Math.ceil(lvl / 2)); dettaglio.push(`${c.nome}: Intelligenza (${fmt(modByAb.INT)}) + metà livello arrotondato per eccesso (${Math.ceil(lvl / 2)}) = ${n}`); }
      else if (c.id === "bardo") { n = BARDO_CONOSCIUTI[lvl]; dettaglio.push(`${c.nome}: ${n} conosciuti al livello ${lvl}`); }
      else if (c.id === "ranger") { n = RANGER_CONOSCIUTI[lvl]; dettaglio.push(`${c.nome}: ${n} conosciuti al livello ${lvl}`); }
      else if (c.id === "stregone") { n = STREGONE_CONOSCIUTI[lvl]; dettaglio.push(`${c.nome}: ${n} conosciuti al livello ${lvl}`); }
      else if (c.id === "warlock") { n = WARLOCK_CONOSCIUTI[lvl]; dettaglio.push(`${c.nome}: ${n} conosciuti al livello ${lvl}`); }
      else if (isTerzoCaster) { n = TERZO_CASTER_CONOSCIUTI[lvl]; dettaglio.push(`${c.nome} (incantatore a un terzo): ${n} conosciuti al livello ${lvl}`); }
      totale += n;
    });
    return { totale, dettaglio };
  }, [pg.classi, modByAb.SAG, modByAb.CAR, modByAb.INT, classi]);

  const iniziativa = modByAb.DES + Number(pg.iniziativaBonus || 0) + bonusExtra("Iniziativa");

  const forzaEffettiva = pg.abilita.FOR + (razzaBonus.FOR || 0) + (sottorazzaBonus.FOR || 0);
  const velocitaBase = sottorazza?.velocita || razza?.velocita || "9 m";
  const richiedeForzaNonSoddisfatta = !!(armaturaEquip && armaturaEquip.forzaMin && forzaEffettiva < armaturaEquip.forzaMin);
  const senzaCompetenzaArmatura = !!(armaturaEquip && pg.compArmature && !pg.compArmature[armaturaEquip.tipo]);
  const velocitaCalcolata = useMemo(() => {
    if (pg.velocitaOverride) return pg.velocitaOverride;
    if (!richiedeForzaNonSoddisfatta) return velocitaBase;
    const numero = parseFloat(String(velocitaBase).replace(",", "."));
    if (isNaN(numero)) return velocitaBase;
    const ridotta = Math.max(0, numero - 3);
    return `${ridotta}`.replace(".", ",") + " m";
  }, [pg.velocitaOverride, velocitaBase, richiedeForzaNonSoddisfatta]);

  const toggleTiro = (ab) => updatePg({ tiriCompetenti: pg.tiriCompetenti.includes(ab) ? pg.tiriCompetenti.filter((x) => x !== ab) : [...pg.tiriCompetenti, ab] });
  const toggleAbilita = (nome) => {
    const comp = pg.abilitaCompetenti.includes(nome);
    updatePg({
      abilitaCompetenti: comp ? pg.abilitaCompetenti.filter((x) => x !== nome) : [...pg.abilitaCompetenti, nome],
      abilitaEsperte: comp ? pg.abilitaEsperte.filter((x) => x !== nome) : pg.abilitaEsperte,
    });
  };
  const toggleEsperto = (nome) => { if (!pg.abilitaCompetenti.includes(nome)) return; updatePg({ abilitaEsperte: pg.abilitaEsperte.includes(nome) ? pg.abilitaEsperte.filter((x) => x !== nome) : [...pg.abilitaEsperte, nome] }); };

  const onRazzaChange = (text) => { const m = razze.find((r) => r.nome.toLowerCase() === text.toLowerCase()); updatePg({ razzaNome: text, razzaId: m ? m.id : null, sottorazzaNome: "", sottorazzaId: null }); };
  const onSottorazzaChange = (text) => { const opts = sottorazze.filter((s) => !pg.razzaId || s.razzaId === pg.razzaId); const m = opts.find((s) => s.nome.toLowerCase() === text.toLowerCase()); updatePg({ sottorazzaNome: text, sottorazzaId: m ? m.id : null }); };

  const setClasseEntry = (instId, patch) => updatePg({ classi: pg.classi.map((c) => (c.instId === instId ? { ...c, ...patch } : c)) });
  const onClasseNomeChange = (instId, isPrimaria, text) => {
    const m = classi.find((c) => c.nome.toLowerCase() === text.toLowerCase());
    if (isPrimaria) updatePg({ classi: pg.classi.map((c) => (c.instId === instId ? { ...c, nome: text, classeId: m ? m.id : null, sottoclasseNome: "", sottoclasseId: null } : c)), tiriCompetenti: m ? m.tiri : pg.tiriCompetenti });
    else setClasseEntry(instId, { nome: text, classeId: m ? m.id : null, sottoclasseNome: "", sottoclasseId: null });
  };
  const onSottoclasseChange = (instId, classeId, text) => { const opts = sottoclassi.filter((s) => s.classeId === classeId); const m = opts.find((s) => s.nome.toLowerCase() === text.toLowerCase()); setClasseEntry(instId, { sottoclasseNome: text, sottoclasseId: m ? m.id : null }); };
  const aggiungiClasseMulti = () => updatePg({ classi: [...pg.classi, { instId: uid(), nome: "", classeId: null, sottoclasseNome: "", sottoclasseId: null, livello: 1 }] });
  const rimuoviClasseMulti = (instId) => { if (pg.classi.length <= 1) return; updatePg({ classi: pg.classi.filter((c) => c.instId !== instId) }); };

  const [spellQuery, setSpellQuery] = useState("");
  const spellResults = useMemo(() => (spellQuery.trim() ? incantesimi.filter((s) => s.nome.toLowerCase().includes(spellQuery.toLowerCase()) || s.scuola.toLowerCase().includes(spellQuery.toLowerCase())).slice(0, 8) : []), [spellQuery, incantesimi]);
  const aggiungiIncantesimo = (id) => { if (!pg.incantesimiNoti.includes(id)) updatePg({ incantesimiNoti: [...pg.incantesimiNoti, id] }); };
  const rimuoviIncantesimo = (id) => updatePg({ incantesimiNoti: pg.incantesimiNoti.filter((x) => x !== id) });

  // Incantesimi innati concessi da razza/sottorazza per regolamento, sbloccati progressivamente col livello del personaggio.
  const INCANTESIMI_RAZZIALI = {
    tiefling: [{ id: "taumaturgia", livello: 1 }, { id: "scherno_infernale", livello: 3 }, { id: "oscurita", livello: 5 }],
    aasimar: [{ id: "luce", livello: 1 }, { id: "ristorazione_inferiore", livello: 3 }, { id: "luce_del_giorno", livello: 5 }],
    elfo_scuro: [{ id: "luci_danzanti", livello: 1 }, { id: "fuoco_fatuo", livello: 3 }, { id: "oscurita", livello: 5 }],
  };
  const sincronizzaIncantesimiRazza = () => {
    const attesi = [
      ...(INCANTESIMI_RAZZIALI[pg.razzaId] || []),
      ...(INCANTESIMI_RAZZIALI[pg.sottorazzaId] || []),
    ].filter((r) => livelloTotale >= r.livello).map((r) => r.id);
    if (!attesi.length) return;
    const nuovi = attesi.filter((id) => !pg.incantesimiNoti.includes(id));
    if (nuovi.length) updatePg({ incantesimiNoti: [...pg.incantesimiNoti, ...nuovi] });
  };

  // Incantesimi "sempre pronti" concessi da Domini del Chierico, Giuramenti del Paladino e Patroni del Warlock,
  // sbloccati ai livelli di classe indicati (non contano nel numero di incantesimi preparati/conosciuti).
  const INCANTESIMI_SOTTOCLASSE = {
    dominio_vita: [[1, "benedizione"], [1, "cura_ferite"], [3, "ristorazione_inferiore"], [3, "arma_spirituale"], [5, "faro_speranza"], [5, "rianimare"], [7, "negazione_morte"], [7, "guardiano_della_fede"], [9, "cura_ferite_di_massa"], [9, "resurrezione"]],
    dominio_luce: [[1, "mani_ardenti"], [1, "fuoco_fatuo"], [3, "sfera_fiammeggiante"], [3, "raggio_infuocato"], [5, "luce_del_giorno"], [5, "palla_di_fuoco"], [7, "guardiano_della_fede"], [7, "muro_di_fuoco"], [9, "colpo_di_fiamma"], [9, "scrutare"]],
    dominio_conoscenza: [[1, "comando"], [1, "identificazione"], [3, "presagio"], [3, "suggestione"], [5, "non_individuazione"], [5, "parlare_coi_morti"], [7, "occhio_arcano"], [7, "confusione"], [9, "sapienza_leggendaria"], [9, "scrutare"]],
    dominio_natura: [[1, "amicizia_animali"], [1, "parlare_con_animali"], [3, "pelle_di_corteccia"], [3, "intralciare"], [5, "crescita_vegetale"], [5, "muro_di_vento"], [7, "dominare_bestia"], [7, "liana_afferrante"], [9, "piaga_insetti"], [9, "passo_arboreo"]],
    dominio_tempesta: [[1, "nube_nebbia"], [1, "onda_tonante"], [3, "raffica_vento"], [3, "infrangere"], [5, "controllare_acqua"], [7, "controllare_acqua"], [7, "tempesta_di_ghiaccio"], [9, "piaga_insetti"]],
    dominio_inganno: [[1, "charme_persone"], [1, "travestire_se_stesso"], [3, "immagine_speculare"], [3, "assenza_di_tracce"], [5, "sfarfallio"], [5, "dissolvi_magie"], [7, "porta_dimensionale"], [7, "tramutare"], [9, "dominare_persona"], [9, "modificare_memoria"]],
    dominio_guerra: [[1, "favore_divino"], [1, "scudo_della_fede"], [3, "arma_magica"], [3, "manto_crociato"], [5, "guardiani_spirituali"], [7, "liberta_movimento"], [7, "sfondamuro"], [9, "immobilizzare_mostro"]],
    dominio_ordine: [[1, "comando"], [1, "eroismo"], [3, "immobilizzare_persone"], [3, "zona_di_verita"]],
    dominio_pace: [[1, "santuario"], [1, "eroismo"], [3, "aiuto"], [3, "legame_di_guardia"], [5, "faro_speranza"], [5, "messaggero_arcano"]],
    dominio_crepuscolo: [[1, "fuoco_fatuo"], [1, "sonno"]],
    giuramento_devozione: [[3, "sonno"], [5, "ristorazione_inferiore"], [9, "faro_speranza"], [9, "dissolvi_magie"], [13, "liberta_movimento"], [13, "guardiano_della_fede"], [17, "colpo_di_fiamma"]],
    giuramento_antichi: [[3, "colpo_intrappolante"], [3, "parlare_con_animali"], [5, "raggio_di_luna"], [5, "passo_velato"], [9, "crescita_vegetale"], [9, "protezione_da_energia"], [13, "tempesta_di_ghiaccio"], [17, "passo_arboreo"]],
    giuramento_vendetta: [[5, "immobilizzare_persone"], [5, "passo_velato"], [9, "prestezza"], [9, "protezione_da_energia"], [13, "bando"], [13, "porta_dimensionale"], [17, "immobilizzare_mostro"], [17, "scrutare"]],
    patrono_immondo: [[1, "mani_ardenti"], [1, "comando"], [3, "sfera_fiammeggiante"], [3, "raggio_infuocato"], [5, "palla_di_fuoco"], [7, "muro_di_fuoco"], [9, "colpo_di_fiamma"]],
    patrono_genio: [[1, "individuazione_bene_male"], [5, "cibo_acqua"], [7, "uccisore_fantasmatico"], [9, "creazione"], [17, "desiderio"]], // lista comune a tutti i tipi di Genio
    arcana_fata: [[1, "fuoco_fatuo"], [1, "sonno"], [3, "immagine_maggiore"], [5, "sfarfallio"], [5, "crescita_vegetale"], [7, "porta_dimensionale"], [9, "sogno"], [9, "piaga_insetti"]],
    grande_antico: [[1, "bisbigli_dissonanti"], [1, "risata_di_tasha"], [3, "individuazione_pensieri"], [3, "immagine_maggiore"], [5, "chiaroveggenza"], [5, "messaggero_arcano"], [7, "dominare_bestia"], [7, "tentacoli_neri"], [9, "sogno"], [9, "telecinesi"]],
    giuramento_gloria: [[3, "dardo_guida"], [3, "eroismo"], [5, "potenziare_caratteristica"], [5, "arma_magica"], [9, "prestezza"], [9, "protezione_da_energia"], [13, "costrizione"], [13, "liberta_movimento"], [17, "comunione"], [17, "colpo_di_fiamma"]],
    giuramento_guardiani: [[3, "allarme"], [3, "individuazione_magia"], [5, "raggio_di_luna"], [5, "vedere_invisibile"], [9, "contromagia"], [9, "non_individuazione"], [13, "bando"], [17, "immobilizzare_mostro"]],
    patrono_abissale: [[1, "onda_tonante"], [3, "raffica_vento"], [3, "silenzio"], [5, "fulmine"]], // lista parziale: confermati solo alcuni incantesimi con sicurezza, mancano alcune coppie complete
  };
  const INCANTESIMI_GENIO_TIPO = {
    Dao: [[1, "santuario"], [3, "crescita_spine"], [5, "fondersi_pietra"], [7, "modellare_pietra"], [9, "muro_di_pietra"]],
    Djinni: [[1, "onda_tonante"], [3, "raffica_vento"], [5, "muro_di_vento"], [7, "invisibilita_superiore"], [9, "sembianze"]],
    Efreeti: [[1, "mani_ardenti"], [3, "raggio_infuocato"], [5, "palla_di_fuoco"], [7, "scudo_del_fuoco"], [9, "colpo_di_fiamma"]],
    Marid: [[1, "nube_nebbia"], [3, "confondere"], [5, "tempesta_scaglie_gelo"], [7, "controllare_acqua"], [9, "cono_di_freddo"]],
  };
  const sincronizzaIncantesimiSottoclasse = () => {
    const attesi = new Set();
    pg.classi.forEach((ce) => {
      const lista = INCANTESIMI_SOTTOCLASSE[ce.sottoclasseId];
      if (!lista) return;
      const lvl = Number(ce.livello) || 0;
      lista.filter(([lMin]) => lvl >= lMin).forEach(([, id]) => attesi.add(id));
      if (ce.sottoclasseId === "patrono_genio" && pg.genioTipo && INCANTESIMI_GENIO_TIPO[pg.genioTipo]) {
        INCANTESIMI_GENIO_TIPO[pg.genioTipo].filter(([lMin]) => lvl >= lMin).forEach(([, id]) => attesi.add(id));
      }
    });
    const nuovi = [...attesi].filter((id) => !pg.incantesimiNoti.includes(id));
    if (nuovi.length) updatePg({ incantesimiNoti: [...pg.incantesimiNoti, ...nuovi] });
  };

  const [wQuery, setWQuery] = useState(""); const [aQuery, setAQuery] = useState(""); const [accQuery, setAccQuery] = useState("");
  const wResults = useMemo(() => (wQuery.trim() ? armi.filter((w) => w.nome.toLowerCase().includes(wQuery.toLowerCase())).slice(0, 8) : []), [wQuery, armi]);
  const aResults = useMemo(() => (aQuery.trim() ? armature.filter((a) => a.nome.toLowerCase().includes(aQuery.toLowerCase())).slice(0, 8) : []), [aQuery, armature]);
  const accResults = useMemo(() => (accQuery.trim() ? accessori.filter((a) => a.nome.toLowerCase().includes(accQuery.toLowerCase())).slice(0, 8) : []), [accQuery, accessori]);
  const aggiungiArma = (refId) => { const w = armi.find((x) => x.id === refId); updatePg({ armiPossedute: [...pg.armiPossedute, { instId: uid(), refId, magico: "", rarita: "", modTpc: 0, modDanno: 0, note: w?.note && w.note !== "—" ? w.note : "" }] }); };
  const rimuoviArma = (instId) => updatePg({ armiPossedute: pg.armiPossedute.filter((x) => x.instId !== instId) });
  const aggiornaCampoArma = (instId, patch) => updatePg({ armiPossedute: pg.armiPossedute.map((x) => (x.instId === instId ? { ...x, ...patch } : x)) });
  const aggiungiArmatura = (refId) => updatePg({ armaturePossedute: [...pg.armaturePossedute, { instId: uid(), refId, magico: "", rarita: "", note: "" }] });
  const rimuoviArmatura = (instId) => updatePg({ armaturePossedute: pg.armaturePossedute.filter((x) => x.instId !== instId), armaturaIndossataInstId: pg.armaturaIndossataInstId === instId ? null : pg.armaturaIndossataInstId });
  const aggiornaCampoArmatura = (instId, patch) => updatePg({ armaturePossedute: pg.armaturePossedute.map((x) => (x.instId === instId ? { ...x, ...patch } : x)) });
  const aggiungiAccessorio = (refId) => updatePg({ accessoriPosseduti: [...pg.accessoriPosseduti, { instId: uid(), refId, magico: "", rarita: "", note: "" }] });
  const rimuoviAccessorio = (instId) => updatePg({ accessoriPosseduti: pg.accessoriPosseduti.filter((x) => x.instId !== instId) });
  const aggiornaCampoAccessorio = (instId, patch) => updatePg({ accessoriPosseduti: pg.accessoriPosseduti.map((x) => (x.instId === instId ? { ...x, ...patch } : x)) });

  const aggiungiVoceInventario = () => updatePg({ inventario: [...pg.inventario, { id: uid(), nome: "", quantita: 1, posizione: "Zaino" }] });
  const aggiornaVoceInventario = (id, patch) => updatePg({ inventario: pg.inventario.map((v) => (v.id === id ? { ...v, ...patch } : v)) });
  const rimuoviVoceInventario = (id) => updatePg({ inventario: pg.inventario.filter((v) => v.id !== id) });

  const aggiungiValuta = () => updatePg({ valute: [...pg.valute, { id: uid(), categoria: "", speso: 0, ricavato: 0, inPossesso: 0 }] });
  const rimuoviValuta = (id) => updatePg({ valute: pg.valute.filter((v) => v.id !== id) });
  const aggiornaCategoriaValuta = (id, categoria) => updatePg({ valute: pg.valute.map((v) => (v.id === id ? { ...v, categoria } : v)) });
  const onSpesoChange = (id, nuovo) => updatePg({ valute: pg.valute.map((v) => (v.id === id ? { ...v, speso: 0, inPossesso: v.inPossesso - nuovo } : v)) });
  const onRicavatoChange = (id, nuovo) => updatePg({ valute: pg.valute.map((v) => (v.id === id ? { ...v, ricavato: 0, inPossesso: v.inPossesso + nuovo } : v)) });
  const onInPossessoChange = (id, nuovo) => updatePg({ valute: pg.valute.map((v) => (v.id === id ? { ...v, inPossesso: nuovo } : v)) });

  const aggiungiInfoExtra = () => updatePg({ infoExtra: [...pg.infoExtra, { id: uid(), chiave: "", valore: "" }] });
  const aggiornaInfoExtra = (id, patch) => updatePg({ infoExtra: pg.infoExtra.map((v) => (v.id === id ? { ...v, ...patch } : v)) });
  const rimuoviInfoExtra = (id) => updatePg({ infoExtra: pg.infoExtra.filter((v) => v.id !== id) });

  const sincronizzaCompetenzeEquip = () => {
    const risultato = { armature: { leggera: false, media: false, pesante: false }, scudi: false, armi: { improvvisata: false, semplice: false, daGuerra: false } };
    pg.classi.forEach((ce) => {
      const c = classi.find((x) => x.id === ce.classeId);
      if (!c || !c.compEquip) return;
      risultato.armature.leggera = risultato.armature.leggera || c.compEquip.armature.leggera;
      risultato.armature.media = risultato.armature.media || c.compEquip.armature.media;
      risultato.armature.pesante = risultato.armature.pesante || c.compEquip.armature.pesante;
      risultato.scudi = risultato.scudi || c.compEquip.scudi;
      risultato.armi.improvvisata = risultato.armi.improvvisata || c.compEquip.armi.improvvisata;
      risultato.armi.semplice = risultato.armi.semplice || c.compEquip.armi.semplice;
      risultato.armi.daGuerra = risultato.armi.daGuerra || c.compEquip.armi.daGuerra;
    });
    updatePg({ compArmature: risultato.armature, compScudi: risultato.scudi, compArmi: risultato.armi });
  };

  const raccogliTrattiRazziali = () => {
    const out = [];
    if (razza) razza.tratti.forEach((t) => out.push({ ...t, fonte: `Razza (${razza.nome})` }));
    if (sottorazza) sottorazza.tratti.forEach((t) => out.push({ ...t, fonte: `Sottorazza (${sottorazza.nome})` }));
    return out;
  };
  const raccogliPrivilegiClasse = () => {
    const out = [];
    pg.classi.forEach((ce) => {
      const c = classi.find((x) => x.id === ce.classeId);
      if (c) c.tratti.filter((t) => (t.livello || 1) <= (Number(ce.livello) || 0)).forEach((t) => out.push({ ...t, fonte: `Classe (${c.nome})` }));
      const sc = sottoclassi.find((x) => x.id === ce.sottoclasseId);
      if (sc) sc.tratti.filter((t) => (t.livello || 1) <= (Number(ce.livello) || 0)).forEach((t) => out.push({ ...t, fonte: `Sottoclasse (${sc.nome})` }));
    });
    return out;
  };
  const sincronizzaTrattiRazziali = () => {
    const attesi = raccogliTrattiRazziali();
    const conservati = pg.trattiRazziali.filter((e) => e.fonte === "Manuale" || attesi.some((t) => t.nome === e.nome && t.fonte === e.fonte));
    const nuovi = attesi.filter((t) => !pg.trattiRazziali.some((e) => e.nome === t.nome && e.fonte === t.fonte));
    updatePg({ trattiRazziali: [...conservati, ...nuovi.map((t) => ({ id: uid(), nome: t.nome, desc: t.desc, fonte: t.fonte, applicaA: "nessuno", valore: 0 }))] });
  };
  const sincronizzaPrivilegiClasse = () => {
    const attesi = raccogliPrivilegiClasse();
    const conservati = pg.privilegiClasse.filter((e) => e.fonte === "Manuale" || attesi.some((t) => t.nome === e.nome && t.fonte === e.fonte));
    const nuovi = attesi.filter((t) => !pg.privilegiClasse.some((e) => e.nome === t.nome && e.fonte === t.fonte));
    updatePg({ privilegiClasse: [...conservati, ...nuovi.map((t) => ({ id: uid(), nome: t.nome, desc: t.desc, fonte: t.fonte, applicaA: "nessuno", valore: 0 }))] });
  };
  const aggiornaTrattoRazziale = (id, patch) => updatePg({ trattiRazziali: pg.trattiRazziali.map((e) => (e.id === id ? { ...e, ...patch } : e)) });
  const rimuoviTrattoRazziale = (id) => updatePg({ trattiRazziali: pg.trattiRazziali.filter((e) => e.id !== id) });
  const [nuovoTrattoRazziale, setNuovoTrattoRazziale] = useState({ nome: "", desc: "" });
  const aggiungiTrattoRazzialeManuale = () => { if (!nuovoTrattoRazziale.nome.trim()) return; updatePg({ trattiRazziali: [...pg.trattiRazziali, { id: uid(), nome: nuovoTrattoRazziale.nome, desc: nuovoTrattoRazziale.desc, fonte: "Manuale", applicaA: "nessuno", valore: 0 }] }); setNuovoTrattoRazziale({ nome: "", desc: "" }); };

  const aggiornaPrivilegioClasse = (id, patch) => updatePg({ privilegiClasse: pg.privilegiClasse.map((e) => (e.id === id ? { ...e, ...patch } : e)) });
  const rimuoviPrivilegioClasse = (id) => updatePg({ privilegiClasse: pg.privilegiClasse.filter((e) => e.id !== id) });
  const [nuovoPrivilegioClasse, setNuovoPrivilegioClasse] = useState({ nome: "", desc: "" });
  const aggiungiPrivilegioClasseManuale = () => { if (!nuovoPrivilegioClasse.nome.trim()) return; updatePg({ privilegiClasse: [...pg.privilegiClasse, { id: uid(), nome: nuovoPrivilegioClasse.nome, desc: nuovoPrivilegioClasse.desc, fonte: "Manuale", applicaA: "nessuno", valore: 0 }] }); setNuovoPrivilegioClasse({ nome: "", desc: "" }); };

  const [nuovaAbilita, setNuovaAbilita] = useState({ nome: "", ab: "FOR" });
  const aggiungiAbilita = () => { if (!nuovaAbilita.nome.trim()) return; setSkills((s) => [...s, { name: nuovaAbilita.nome, ab: nuovaAbilita.ab, custom: true }]); setNuovaAbilita({ nome: "", ab: "FOR" }); };
  const rimuoviAbilita = (nome) => { setSkills((s) => s.filter((x) => x.name !== nome)); updatePg({ abilitaCompetenti: pg.abilitaCompetenti.filter((x) => x !== nome), abilitaEsperte: pg.abilitaEsperte.filter((x) => x !== nome) }); };
  const [draggedSkill, setDraggedSkill] = useState(null);
  const [draggedInv, setDraggedInv] = useState(null);
  const [draggedPriv, setDraggedPriv] = useState(null);
  const spostaPrivilegioClasse = (targetId) => {
    if (!draggedPriv || draggedPriv === targetId) { setDraggedPriv(null); return; }
    updatePg({ privilegiClasse: (() => {
      const nuovo = pg.privilegiClasse.filter((x) => x.id !== draggedPriv);
      const idx = nuovo.findIndex((x) => x.id === targetId);
      const spostato = pg.privilegiClasse.find((x) => x.id === draggedPriv);
      nuovo.splice(idx, 0, spostato);
      return nuovo;
    })() });
    setDraggedPriv(null);
  };
  const [draggedTratto, setDraggedTratto] = useState(null);
  const spostaTrattoRazziale = (targetId) => {
    if (!draggedTratto || draggedTratto === targetId) { setDraggedTratto(null); return; }
    updatePg({ trattiRazziali: (() => {
      const nuovo = pg.trattiRazziali.filter((x) => x.id !== draggedTratto);
      const idx = nuovo.findIndex((x) => x.id === targetId);
      const spostato = pg.trattiRazziali.find((x) => x.id === draggedTratto);
      nuovo.splice(idx, 0, spostato);
      return nuovo;
    })() });
    setDraggedTratto(null);
  };
  const spostaVoceInventario = (targetId) => {
    if (!draggedInv || draggedInv === targetId) { setDraggedInv(null); return; }
    updatePg({ inventario: (() => {
      const nuovo = pg.inventario.filter((x) => x.id !== draggedInv);
      const idx = nuovo.findIndex((x) => x.id === targetId);
      const spostata = pg.inventario.find((x) => x.id === draggedInv);
      nuovo.splice(idx, 0, spostata);
      return nuovo;
    })() });
    setDraggedInv(null);
  };
  const spostaSkill = (targetName) => {
    if (!draggedSkill || draggedSkill === targetName) { setDraggedSkill(null); return; }
    setSkills((s) => {
      const nuovo = s.filter((x) => x.name !== draggedSkill);
      const idx = nuovo.findIndex((x) => x.name === targetName);
      const spostata = s.find((x) => x.name === draggedSkill);
      nuovo.splice(idx, 0, spostata);
      return nuovo;
    });
    setDraggedSkill(null);
  };

  const [dannoInput, setDannoInput] = useState("");
  const applicaDanno = (raw) => {
    const n = Number(raw);
    if (!n || n <= 0) return;
    const tempUsed = Math.min(pg.pfTemp, n);
    updatePg({ pfTemp: pg.pfTemp - tempUsed, pfAttuali: Math.max(0, pg.pfAttuali - n), pfDanniTotale: pg.pfDanniTotale + n });
  };
  const onTempChange = (nuovoVal) => { const delta = nuovoVal - pg.pfTemp; updatePg({ pfTemp: nuovoVal, pfAttuali: pg.pfAttuali + delta }); };

  const calcolaPfMedia = () => {
    let totale = 0;
    pg.classi.forEach((ce, idx) => {
      const c = classi.find((x) => x.id === ce.classeId);
      if (!c) return;
      const livelli = Math.max(0, Number(ce.livello) || 0);
      for (let l = 1; l <= livelli; l++) {
        const primoLivelloAssoluto = idx === 0 && l === 1;
        const perLivello = primoLivelloAssoluto ? c.dado : Math.ceil(c.dado / 2) + 1;
        totale += perLivello + modByAb.COS;
      }
    });
    updatePg({ pfMax: Math.max(1, totale) });
  };

  const aggiungiTalento = () => updatePg({ talenti: [...pg.talenti, { id: uid(), nome: "", desc: "", applicaA: "nessuno", valore: 0 }] });
  const aggiornaTalento = (id, patch) => updatePg({ talenti: pg.talenti.map((t) => (t.id === id ? { ...t, ...patch } : t)) });
  const rimuoviTalento = (id) => updatePg({ talenti: pg.talenti.filter((t) => t.id !== id) });

  const aggiornaSlot = (livello, patch) => updatePg({ slotIncantesimo: pg.slotIncantesimo.map((s) => (s.livello === livello ? { ...s, ...patch } : s)) });
  const aggiornaPuntiStregoneria = (patch) => updatePg({ puntiStregoneria: { ...pg.puntiStregoneria, ...patch } });
  const aggiornaPuntiKi = (patch) => updatePg({ puntiKi: { ...pg.puntiKi, ...patch } });
  const livelloMonaco = pg.classi.filter((ce) => ce.classeId === "monaco").reduce((s, ce) => s + (Number(ce.livello) || 0), 0);
  const livelloPaladino = pg.classi.filter((ce) => ce.classeId === "paladino").reduce((s, ce) => s + (Number(ce.livello) || 0), 0);
  const livelloArtificiere = pg.classi.filter((ce) => ce.classeId === "artificiere").reduce((s, ce) => s + (Number(ce.livello) || 0), 0);
  const [mostraFinestraInfusioni, setMostraFinestraInfusioni] = useState(false);
  const sincronizzaKi = () => {
    const totali = livelloMonaco >= 2 ? livelloMonaco : 0;
    updatePg({ puntiKi: { totali, usati: Math.min(pg.puntiKi.usati, totali) } });
  };
  const cdKi = 8 + profBonus + modByAb.SAG;

  const sincronizzaSlot = () => {
    let livelloCombinato = 0;
    let warlockLivello = 0;
    let stregoneLivello = 0;
    // Un personaggio e' "multiclasse" ai fini degli incantesimi se ha piu' di una classe con livelli,
    // Warlock incluso nel conteggio anche se la sua Magia del Patto resta sempre separata.
    const numClassiConLivello = pg.classi.filter((ce) => (Number(ce.livello) || 0) > 0).length;
    const isMulticlasse = numClassiConLivello > 1;
    pg.classi.forEach((ce) => {
      const c = classi.find((x) => x.id === ce.classeId);
      if (!c) return;
      const lvl = Number(ce.livello) || 0;
      if (c.id === "warlock") { warlockLivello += lvl; return; }
      if (c.id === "stregone") stregoneLivello += lvl;
      const isTerzoCaster = TERZO_CASTER_SOTTOCLASSI.includes(ce.sottoclasseId);
      if (isMulticlasse) {
        // Regola ufficiale di multiclasse: si sommano i contributi arrotondati per difetto.
        if (c.progressione === "pieno") livelloCombinato += lvl;
        else if (c.progressione === "mezzo") livelloCombinato += Math.floor(lvl / 2);
        else if (isTerzoCaster) livelloCombinato += Math.floor(lvl / 3);
      } else {
        // Personaggio non multiclasse: si usa la tabella diretta della propria classe,
        // che NON coincide con la formula di multiclasse (arrotonda per eccesso, non per difetto,
        // e non concede nulla prima del livello in cui la classe ottiene la magia).
        // L'Artificiere è un'eccezione: è un incantatore a metà che arrotonda per eccesso
        // fin dal 1° livello, senza dover aspettare il 2° come Paladino e Ranger.
        if (c.progressione === "pieno") livelloCombinato += lvl;
        else if (c.progressione === "mezzo" && c.id === "artificiere") livelloCombinato += Math.ceil(lvl / 2);
        else if (c.progressione === "mezzo") livelloCombinato += lvl < 2 ? 0 : Math.ceil(lvl / 2);
        else if (isTerzoCaster) livelloCombinato += lvl < 3 ? 0 : Math.ceil(lvl / 3);
      }
    });
    livelloCombinato = Math.min(20, livelloCombinato);
    const rigaBase = TABELLA_SLOT_PIENI[livelloCombinato] || TABELLA_SLOT_PIENI[0];
    const totaliPerLivello = [...rigaBase];
    if (warlockLivello > 0) {
      const patto = TABELLA_PATTO_WARLOCK[Math.min(20, warlockLivello)];
      if (patto.livello > 0) totaliPerLivello[patto.livello - 1] += patto.slots;
    }
    updatePg({
      slotIncantesimo: pg.slotIncantesimo.map((s) => ({ ...s, totali: totaliPerLivello[s.livello - 1] || 0, usati: Math.min(s.usati, totaliPerLivello[s.livello - 1] || 0) })),
      puntiStregoneria: { totali: puntiStregoneriaPerLivello(stregoneLivello), usati: Math.min(pg.puntiStregoneria.usati, puntiStregoneriaPerLivello(stregoneLivello)) },
    });
  };

  const [critWeapons, setCritWeapons] = useState({}); const [critSpells, setCritSpells] = useState({});
  const weaponAbilityMod = (w) => (w.categoria === "distanza" ? modByAb.DES : w.finesse ? Math.max(modByAb.FOR, modByAb.DES) : modByAb.FOR);
  const attaccaConArma = (w, modTpc) => { const abMod = weaponAbilityMod(w); const abLabel = w.categoria === "distanza" ? "DES (a distanza)" : w.finesse ? `${fmt(abMod)} (Finesse)` : "FOR (mischia)"; const extra = Number(modTpc) || 0; openD20Roll({ title: `TpC — ${w.nome}`, modifier: abMod + profBonus + extra, modifierLabel: `${abLabel} ${fmt(abMod)} + Competenza ${fmt(profBonus)}${extra ? ` + Modificatore arma ${fmt(extra)}` : ""}` }); };
  const tiraDannoArma = (instId, w, modDanno, dannoOverride, dannoExtra, tipoDannoExtra) => {
    const abMod = weaponAbilityMod(w);
    const extra = Number(modDanno) || 0;
    const notazione = dannoOverride && dannoOverride.trim() ? dannoOverride : w.danno;
    const tipoBase = w.tipoDanno;
    const bonusBase = abMod + extra;
    const notazioneBaseConBonus = bonusBase !== 0 ? `${notazione}${bonusBase > 0 ? "+" : ""}${bonusBase}` : notazione;
    if (dannoExtra && dannoExtra.trim()) {
      openDiceRoll({
        title: `Danno — ${w.nome}`,
        componenti: [
          { tipo: tipoBase, notazione: notazioneBaseConBonus },
          { tipo: tipoDannoExtra && tipoDannoExtra.trim() ? tipoDannoExtra : "extra", notazione: dannoExtra },
        ],
        doubled: !!critWeapons[instId],
      });
    } else {
      openDiceRoll({ title: `Danno — ${w.nome}`, notation: notazione, flatBonus: abMod + extra, flatBonusLabel: `modificatore caratteristica ${fmt(abMod)}${extra ? ` + Modificatore arma ${fmt(extra)}` : ""}`, doubled: !!critWeapons[instId] });
    }
    setCritWeapons((c) => ({ ...c, [instId]: false }));
  };
  const attaccaConIncantesimo = (s) => { if (!classePrimaria?.caster) return; const cMod = modByAb[classePrimaria.caster]; openD20Roll({ title: `TpC — ${s.nome}`, modifier: cMod + profBonus, modifierLabel: `${ABILITY_LABELS[classePrimaria.caster]} ${fmt(cMod)} + Competenza ${fmt(profBonus)}` }); };
  const tiraDannoIncantesimo = (id, s, dannoExtra, tipoDannoExtra) => {
    const cMod = classePrimaria?.caster ? modByAb[classePrimaria.caster] : 0;
    if (s.cura) {
      const notazione = notazioneEffettiva(s, s.cura);
      openDiceRoll({ title: `Cura — ${s.nome}`, notation: notazione, flatBonus: cMod, flatBonusLabel: `caratteristica da incantatore ${fmt(cMod)}${notazione !== s.cura ? " (potenziato)" : ""}` });
    } else if (s.danno) {
      const notazione = notazioneEffettiva(s, s.danno);
      if (dannoExtra && dannoExtra.trim()) {
        openDiceRoll({
          title: `Danno — ${s.nome}`,
          componenti: [
            { tipo: s.tipoDanno, notazione },
            { tipo: tipoDannoExtra && tipoDannoExtra.trim() ? tipoDannoExtra : "extra", notazione: dannoExtra },
          ],
          doubled: !!critSpells[id],
        });
      } else {
        openDiceRoll({ title: `Danno — ${s.nome}`, notation: notazione, flatBonus: 0, flatBonusLabel: `gli incantesimi di norma non aggiungono il modificatore al danno${notazione !== s.danno ? " (potenziato)" : ""}`, doubled: !!critSpells[id] });
      }
      setCritSpells((c) => ({ ...c, [id]: false }));
    }
  };

  // Estrae il primo termine "NdM" da una notazione di danno/cura (es. "3d4+3" -> {count:3, die:4}).
  const estraiDado = (notazione) => {
    const match = /(\d+)d(\d+)/.exec(notazione || "");
    return match ? { count: Number(match[1]), die: Number(match[2]) } : null;
  };
  // Calcola la notazione effettiva di un incantesimo tenendo conto del livello di lancio scelto (upcast) o, per i trucchetti, del livello del personaggio.
  const notazioneEffettiva = (s, notazioneBase) => {
    const dado = estraiDado(notazioneBase);
    if (!dado) return notazioneBase;
    if (s.livello === 0) {
      const moltiplicatore = livelloTotale >= 17 ? 4 : livelloTotale >= 11 ? 3 : livelloTotale >= 5 ? 2 : 1;
      if (moltiplicatore <= 1) return notazioneBase;
      return notazioneBase.replace(/(\d+)d(\d+)/, `${dado.count * moltiplicatore}d${dado.die}`);
    }
    const livelloLancio = pg.incantesimiLivelloLancio?.[s.id] || s.livello;
    const livelliExtra = Math.max(0, livelloLancio - s.livello);
    if (livelliExtra === 0) return notazioneBase;
    return `${notazioneBase}+${livelliExtra}d${dado.die}`;
  };

  const importInputRef = useRef(null);
  const handleImportFile = (e) => {
    const file = e.target.files?.[0];
    if (file && onImportaPg) onImportaPg(file);
    e.target.value = "";
  };

  return (
    <div style={styles.schedeLayout}>
      <aside style={styles.sidebar}>
        <div style={styles.sidebarTitle}>I tuoi personaggi</div>
        {personaggi.map((p) => (
          <div key={p.id} style={{ ...styles.pgListItem, ...(p.id === attivoId ? styles.pgListItemActive : {}) }}>
            <button style={styles.pgListBtn} onClick={() => setAttivoId(p.id)}>
              <span style={styles.pgListName}>{p.nome || "Senza nome"}</span>
              <span style={styles.pgListSub}>{p.classi[0]?.nome || "—"} · liv. {p.classi.reduce((s, c) => s + Number(c.livello || 0), 0)}</span>
            </button>
            {onEsportaPg && <button style={styles.pgDelBtn} title="Esporta questa scheda" onClick={() => onEsportaPg(p)}>⬇</button>}
            <button style={styles.pgDelBtn} onClick={() => rimuoviPg(p.id)}>✕</button>
          </div>
        ))}
        <button style={styles.newPgBtn} onClick={aggiungiPg}>+ Nuovo personaggio</button>
        <input ref={importInputRef} type="file" accept="application/json" style={{ display: "none" }} onChange={handleImportFile} />
        <button style={styles.newPgBtn} onClick={() => importInputRef.current?.click()}>⬆ Importa scheda</button>
      </aside>

      <section style={styles.sheet}>
        <div style={styles.sheetTopRow}>
          <input style={styles.nameInput} value={pg.nome} onChange={(e) => updatePg({ nome: e.target.value })} placeholder="Nome del personaggio" />
          <div style={styles.sheetTopFields}>
            <label style={styles.miniField}>Nome Giocatore<input style={styles.miniInput} value={pg.nomeGiocatore} onChange={(e) => updatePg({ nomeGiocatore: e.target.value })} placeholder="Il tuo nome" /></label>
            <label style={styles.miniField}>Data Creazione PG<input type="date" style={styles.miniInput} value={pg.dataCreazione} onChange={(e) => updatePg({ dataCreazione: e.target.value })} /></label>
          </div>
        </div>

        {pg.classi.map((ce, i) => i === 0 ? (
          <div key={ce.instId} style={styles.fiveColGrid}>
            <div style={{ ...styles.columnTitle, gridColumn: "1 / span 2" }}>Classi {pg.classi.length > 1 && <span style={styles.hint}>(liv. tot. {livelloTotale})</span>}</div>
            <div style={{ ...styles.columnTitle, gridColumn: "3" }}>Livello</div>
            <div style={{ ...styles.columnTitle, gridColumn: "4 / span 2" }}>Razza</div>
            <ComboInput value={ce.nome} onChangeText={(t) => onClasseNomeChange(ce.instId, true, t)} options={classi} datalistId={`dl-classi-${i}`} placeholder="Classe" style={styles.gridInput} />
            <ComboInput value={ce.sottoclasseNome} onChangeText={(t) => onSottoclasseChange(ce.instId, ce.classeId, t)} options={sottoclassi.filter((s) => s.classeId === ce.classeId)} datalistId={`dl-sottoclassi-${i}`} placeholder="Sottoclasse" style={styles.gridInput} />
            <NumInput min={1} max={20} style={styles.levelInput} value={ce.livello} onCommit={(n) => setClasseEntry(ce.instId, { livello: n })} />
            <ComboInput value={pg.razzaNome} onChangeText={onRazzaChange} options={razze} datalistId="dl-razze" placeholder="Razza" style={styles.gridInput} />
            <ComboInput value={pg.sottorazzaNome} onChangeText={onSottorazzaChange} options={sottorazze.filter((s) => !pg.razzaId || s.razzaId === pg.razzaId)} datalistId="dl-sottorazze" placeholder="Sottorazza" style={styles.gridInput} />
          </div>
        ) : (
          <div key={ce.instId} style={styles.fiveColGrid}>
            <div>
              <div style={styles.columnTitleLeft}>Classe aggiuntiva</div>
              <ComboInput value={ce.nome} onChangeText={(t) => onClasseNomeChange(ce.instId, false, t)} options={classi} datalistId={`dl-classi-${i}`} placeholder="Scegli o scrivi" style={styles.gridInput} />
            </div>
            <div>
              <div style={styles.columnTitleLeft}>Sottoclasse</div>
              <ComboInput value={ce.sottoclasseNome} onChangeText={(t) => onSottoclasseChange(ce.instId, ce.classeId, t)} options={sottoclassi.filter((s) => s.classeId === ce.classeId)} datalistId={`dl-sottoclassi-${i}`} placeholder="Scegli o scrivi" style={styles.gridInput} />
            </div>
            <div>
              <div style={styles.columnTitleLeft}>Livello</div>
              <NumInput min={1} max={20} style={styles.levelInput} value={ce.livello} onCommit={(n) => setClasseEntry(ce.instId, { livello: n })} />
            </div>
            <button style={{ ...styles.pgDelBtn, marginTop: 22 }} onClick={() => rimuoviClasseMulti(ce.instId)}>✕</button>
          </div>
        ))}
        <button style={styles.newPgBtn} onClick={aggiungiClasseMulti}>+ Aggiungi classe (multiclasse)</button>

        <div style={styles.sectionDivider} />
        <div style={styles.derivedRow}>
          <StatBox label="Bonus competenza" value={fmt(profBonus)} sub={`dal livello ${livelloTotale}`} />
          <StatBox label="Iniziativa" value={fmt(iniziativa)} sub="DES + bonus manuale + extra">
            <NumInput min={-10} max={10} style={styles.smallNumInput} value={pg.iniziativaBonus} onCommit={(n) => updatePg({ iniziativaBonus: n })} />
          </StatBox>
          <StatBox label="Classe Armatura" value={caCalcolata} sub={senzaCompetenzaArmatura ? `⚠ Nessuna competenza con ${armaturaEquip.nome}: svantaggio a Forza/Destrezza, TS e attacchi; non puoi lanciare incantesimi` : (armaturaEquip ? armaturaEquip.nome : "nessuna armatura indossata")}>
            <input placeholder="override" style={styles.smallNumInput} value={pg.caOverride ?? ""} onChange={(e) => updatePg({ caOverride: e.target.value === "" ? null : e.target.value })} />
          </StatBox>
          <StatBox label="Velocità" value={velocitaCalcolata} sub={richiedeForzaNonSoddisfatta && !pg.velocitaOverride ? `-3 m: Forza insufficiente per ${armaturaEquip.nome}` : (sottorazza?.velocita ? sottorazza.nome : razza ? razza.nome : "valore predefinito")}>
            <input placeholder="override" style={styles.smallNumInput} value={pg.velocitaOverride ?? ""} onChange={(e) => updatePg({ velocitaOverride: e.target.value === "" ? null : e.target.value })} />
          </StatBox>
          <label style={{ ...styles.statBox, ...styles.checkField, justifyContent: "center" }}><input type="checkbox" checked={pg.scudo} onChange={(e) => updatePg({ scudo: e.target.checked })} />Scudo (+2 CA)</label>
        </div>

        <div style={styles.sectionLabel}>Punti Ferita</div>
        <div style={styles.hpGrid}>
          <div style={styles.hpBox}>
            <div style={styles.hpBoxLabel}>PF Massimi</div>
            <NumInput min={0} max={9999} style={styles.hpBoxInput} value={pg.pfMax} onCommit={(n) => updatePg({ pfMax: n })} />
            <button style={styles.smallBtn} onClick={calcolaPfMedia} title="Livello 1: dado vita massimo + COS. Livelli successivi: media del dado vita + COS.">🔄 Calcola (media)</button>
          </div>
          <div style={styles.hpBox}>
            <div style={styles.hpBoxLabel}>PF Attuali</div>
            <NumInput min={0} max={9999} style={styles.hpBoxInput} value={pg.pfAttuali} onCommit={(n) => updatePg({ pfAttuali: n })} />
            <button style={styles.smallBtn} onClick={() => updatePg({ pfAttuali: pg.pfMax })}>Reset (= massimi)</button>
          </div>
          <div style={styles.hpBox}>
            <div style={styles.hpBoxLabel}>PF Temporanei</div>
            <NumInput min={0} max={9999} style={styles.hpBoxInput} value={pg.pfTemp} onCommit={(n) => onTempChange(n)} />
            <button style={styles.smallBtn} onClick={() => onTempChange(0)}>Reset (= 0)</button>
          </div>
          <div style={styles.hpBox}>
            <div style={styles.hpBoxLabel}>Danni Subiti</div>
            <input style={styles.hpBoxSmallInput} placeholder="nuovo danno, invio" value={dannoInput} onChange={(e) => setDannoInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { applicaDanno(dannoInput); setDannoInput(""); } }} />
            <NumInput min={0} max={9999} style={styles.hpBoxInput} value={pg.pfDanniTotale} onCommit={(n) => updatePg({ pfDanniTotale: n })} />
            <button style={styles.smallBtn} onClick={() => updatePg({ pfDanniTotale: 0 })}>Reset (= 0)</button>
          </div>
          {Object.keys(dadiVitaPerTipo).length > 0 && (
            <div style={styles.hpBox}>
              <div style={styles.hpBoxLabel}>Dadi Vita</div>
              {Object.entries(dadiVitaPerTipo).map(([dado, tot]) => (
                <div key={dado} style={styles.dadiVitaRow}>
                  <span style={styles.dadiVitaLabel}>d{dado}</span>
                  <NumInput min={0} max={tot} style={styles.dadiVitaInput} value={pg.dadiVitaUsati?.[dado] || 0} onCommit={(n) => updatePg({ dadiVitaUsati: { ...pg.dadiVitaUsati, [dado]: n } })} />
                  <span style={styles.dadiVitaTot}>usati / {tot}</span>
                </div>
              ))}
              <button style={styles.smallBtn} onClick={() => updatePg({ dadiVitaUsati: {} })}>Reset (usati = 0)</button>
            </div>
          )}
        </div>
        <div style={styles.hint}>Scrivi un danno e premi Invio: viene tolto prima dai PF Temporanei, poi dagli Attuali, e sommato al totale Danni Subiti. Tutti i box restano modificabili a mano.</div>

        <div style={styles.sectionLabel}>Caratteristiche</div>
        {regoleOpzionali && (
          <div style={styles.hint}>⚙️ Regola opzionale "Personalizzazione dell'Origine" attiva: invece del bonus fisso della razza, puoi assegnare liberamente +2 e +1 a due caratteristiche diverse, oppure +1 a tre caratteristiche diverse. Il campo qui sotto sostituisce del tutto il bonus razza nel totale.</div>
        )}
        <div style={styles.abilityGrid}>
          {ABILITIES.map((a) => {
            const bonusRazzaFisso = (razzaBonus[a] || 0) + (sottorazzaBonus[a] || 0);
            const bonusCustom = pg.bonusOrigineCustom?.[a];
            const bonusRazza = regoleOpzionali && bonusCustom !== undefined && bonusCustom !== null ? bonusCustom : bonusRazzaFisso;
            return (
              <div key={a} style={styles.abilityCard}>
                <div style={styles.abilityName}>{ABILITY_LABELS[a]}</div>
                <NumInput min={1} max={30} style={styles.abilityScoreInput} value={pg.abilita[a] + bonusRazza} onCommit={(n) => updatePg({ abilita: { ...pg.abilita, [a]: n - bonusRazza } })} />
                {regoleOpzionali ? (
                  <label style={styles.modLabel}>Bonus origine
                    <NumInput min={0} max={2} style={styles.modInput} value={bonusCustom ?? bonusRazzaFisso} onCommit={(n) => updatePg({ bonusOrigineCustom: { ...pg.bonusOrigineCustom, [a]: n } })} />
                  </label>
                ) : (
                  bonusRazza !== 0 && <div style={styles.hint}>Include {fmt(bonusRazza)} di bonus razza</div>
                )}
                <div style={styles.abilityModRow}>
                  <span style={styles.abilityMod}>{fmt(modByAb[a])}</span>
                  <button style={styles.diceBtn} onClick={() => openD20Roll({ title: `Prova di ${ABILITY_LABELS[a]}`, modifier: modByAb[a], modifierLabel: `${ABILITY_LABELS[a]} ${fmt(modByAb[a])}` })}>🎲</button>
                </div>
              </div>
            );
          })}
        </div>

        <div style={styles.twoCol}>
          <div>
            <div style={styles.sectionLabel}>Tiri Salvezza</div>
            {ABILITIES.map((a) => {
              const comp = pg.tiriCompetenti.includes(a);
              const valAuto = modByAb[a] + (comp ? profBonus : 0) + bonusExtra(`TS_${a}`);
              const haOverride = pg.tiriSalvezzaOverride && pg.tiriSalvezzaOverride[a] !== undefined && pg.tiriSalvezzaOverride[a] !== null;
              const val = haOverride ? pg.tiriSalvezzaOverride[a] : valAuto;
              return (
                <label key={a} style={styles.checkRow}>
                  <input type="checkbox" checked={comp} onChange={() => toggleTiro(a)} />
                  <span style={styles.checkRowLabel}>{ABILITY_LABELS[a]}</span>
                  <NumInput min={-20} max={30} style={{ ...styles.checkRowValInput, ...(haOverride ? styles.checkRowValOverride : {}) }} value={val} onCommit={(n) => updatePg({ tiriSalvezzaOverride: { ...pg.tiriSalvezzaOverride, [a]: n } })} />
                  {haOverride && <button style={styles.resetOverrideBtn} title="Torna al calcolo automatico" onClick={() => { const next = { ...pg.tiriSalvezzaOverride }; delete next[a]; updatePg({ tiriSalvezzaOverride: next }); }}>⟳</button>}
                  <button style={styles.diceBtn} onClick={() => openD20Roll({ title: `Tiro Salvezza su ${ABILITY_LABELS[a]}`, modifier: val, modifierLabel: haOverride ? "valore personalizzato" : `${ABILITY_LABELS[a]} ${fmt(modByAb[a])}${comp ? ` + Competenza ${fmt(profBonus)}` : ""}` })}>🎲</button>
                </label>
              );
            })}

            <div style={styles.sectionDivider} />
            <div style={styles.columnTitleLeft}>Lancio Incantesimi</div>
            {classiIncantatrici.length > 0 ? (
              classiIncantatrici.map((c) => (
                <div key={c.id} style={{ marginBottom: 10 }}>
                  {classiIncantatrici.length > 1 && <div style={styles.traitSource}>{c.nome}</div>}
                  <div style={styles.checkRow}><span style={styles.checkRowLabel}>Caratteristica</span><span style={styles.checkRowVal}>{ABILITY_LABELS[c.caster]}</span></div>
                  <div style={styles.checkRow}><span style={styles.checkRowLabel}>Modificatore</span><span style={styles.checkRowVal}>{fmt(modByAb[c.caster])}</span></div>
                  <div style={styles.checkRow}><span style={styles.checkRowLabel}>CD Tiro Salvezza</span><span style={styles.checkRowVal}>{8 + profBonus + modByAb[c.caster]}</span></div>
                  <div style={styles.checkRow}><span style={styles.checkRowLabel}>Bonus Attacco</span><span style={styles.checkRowVal}>{fmt(profBonus + modByAb[c.caster])}</span></div>
                </div>
              ))
            ) : (
              <div style={styles.hint}>Nessuna classe incantatrice selezionata: questi valori compariranno automaticamente non appena scegli, come Classe o Classe aggiuntiva, una classe con capacità di lancio incantesimi.</div>
            )}
          </div>
          <div>
            <div style={styles.sectionLabel}>Abilità</div>
            <div style={styles.skillHeaderRow}>
              <span style={styles.dragHandle}> </span>
              <div style={styles.checkboxGroup}>
                <span style={styles.skillHeaderFlag} title="Competente">Comp.</span>
                <span style={styles.skillHeaderFlag} title="Esperto (maestria)">Esp.</span>
              </div>
              <span style={{ flex: 1 }} />
            </div>
            {skills.map((s) => {
              const comp = pg.abilitaCompetenti.includes(s.name);
              const esperto = pg.abilitaEsperte.includes(s.name);
              const valAuto = modByAb[s.ab] + (esperto ? profBonus * 2 : comp ? profBonus : 0) + bonusExtra(`SKILL_${s.name}`);
              const haOverride = pg.abilitaOverride && pg.abilitaOverride[s.name] !== undefined && pg.abilitaOverride[s.name] !== null;
              const val = haOverride ? pg.abilitaOverride[s.name] : valAuto;
              return (
                <label
                  key={s.name}
                  style={{ ...styles.checkRow, ...(draggedSkill === s.name ? styles.tabBtnDragging : {}) }}
                  draggable
                  onDragStart={() => setDraggedSkill(s.name)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => spostaSkill(s.name)}
                  onDragEnd={() => setDraggedSkill(null)}
                >
                  <span style={styles.dragHandle} title="Trascina per riordinare">⠿</span>
                  <div style={styles.checkboxGroup}>
                    <span style={styles.checkboxCol}><input type="checkbox" checked={comp} onChange={() => toggleAbilita(s.name)} title="Competente" /></span>
                    <span style={styles.checkboxCol}><input type="checkbox" checked={esperto} onChange={() => toggleEsperto(s.name)} title="Esperto (maestria)" disabled={!comp} style={{ opacity: comp ? 1 : 0.4 }} /></span>
                  </div>
                  <span style={styles.checkRowLabel}>{s.name} <em style={styles.abTag}>({s.ab}){esperto ? " ★E" : ""}</em></span>
                  <NumInput min={-20} max={30} style={{ ...styles.checkRowValInput, ...(haOverride ? styles.checkRowValOverride : {}) }} value={val} onCommit={(n) => updatePg({ abilitaOverride: { ...pg.abilitaOverride, [s.name]: n } })} />
                  {haOverride && <button style={styles.resetOverrideBtn} title="Torna al calcolo automatico" onClick={() => { const next = { ...pg.abilitaOverride }; delete next[s.name]; updatePg({ abilitaOverride: next }); }}>⟳</button>}
                  <button style={styles.diceBtn} onClick={() => openD20Roll({ title: s.name, modifier: val, modifierLabel: haOverride ? "valore personalizzato" : `${ABILITY_LABELS[s.ab]} ${fmt(modByAb[s.ab])}${esperto ? " + Competenza x2 (Esperto)" : comp ? ` + Competenza ${fmt(profBonus)}` : ""}` })}>🎲</button>
                  {s.custom && <button style={styles.pgDelBtn} onClick={() => rimuoviAbilita(s.name)}>✕</button>}
                </label>
              );
            })}
            <div style={styles.hpGrid2}>
              <input style={styles.formInput} placeholder="Nuova abilità homebrew" value={nuovaAbilita.nome} onChange={(e) => setNuovaAbilita({ ...nuovaAbilita, nome: e.target.value })} />
              <select style={styles.formInput} value={nuovaAbilita.ab} onChange={(e) => setNuovaAbilita({ ...nuovaAbilita, ab: e.target.value })}>{ABILITIES.map((a) => <option key={a} value={a}>{a}</option>)}</select>
              <button style={styles.smallBtn} onClick={aggiungiAbilita}>+ Aggiungi</button>
            </div>
            <div style={styles.hint}>La casella di sinistra indica Competente, quella di destra Esperto (maestria, richiede competenza — raddoppia il bonus).</div>
          </div>
        </div>

        <div style={styles.twoCol}>
          <div>
            <div style={styles.sectionLabel}>Privilegi di Classe <button style={styles.smallBtn} onClick={sincronizzaPrivilegiClasse}>🔄 Sincronizza</button></div>
            <div style={styles.hint}>Privilegi automatici di classe e sottoclasse (di tutte le classi in caso di multiclasse), più eventuali voci manuali. Puoi collegare ognuno a un bonus numerico che influisce sui calcoli.</div>
            <div style={styles.itemList}>
              {pg.privilegiClasse.map((e) => (
                <div
                  key={e.id}
                  style={{ ...styles.abilitaExtraRow, ...(draggedPriv === e.id ? styles.tabBtnDragging : {}) }}
                  draggable
                  onDragStart={() => setDraggedPriv(e.id)}
                  onDragOver={(ev) => ev.preventDefault()}
                  onDrop={() => spostaPrivilegioClasse(e.id)}
                  onDragEnd={() => setDraggedPriv(null)}
                >
                  <span style={styles.dragHandle} title="Trascina per riordinare">⠿</span>
                  <div style={{ flex: 1 }}>
                    <input style={styles.traitTitleInput} value={e.nome} onChange={(ev) => aggiornaPrivilegioClasse(e.id, { nome: ev.target.value })} />
                    <div style={styles.traitSource}>{nomeFonte(e.fonte)}</div>
                    <AutoTextarea style={styles.traitDescInput} value={e.desc} onChange={(ev) => aggiornaPrivilegioClasse(e.id, { desc: ev.target.value })} />
                  </div>
                  <select style={styles.applicaASelect} value={e.applicaA} onChange={(ev) => aggiornaPrivilegioClasse(e.id, { applicaA: ev.target.value })}>
                    {APPLICA_A_OPTIONS(skills).map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                  {e.applicaA !== "nessuno" && <NumInput min={-20} max={20} style={styles.smallNumInput} value={e.valore} onCommit={(n) => aggiornaPrivilegioClasse(e.id, { valore: n })} />}
                  <button style={styles.pgDelBtn} onClick={() => rimuoviPrivilegioClasse(e.id)}>✕</button>
                </div>
              ))}
            </div>
            <div style={styles.formRow}>
              <input style={styles.formInput} placeholder="Nome privilegio manuale" value={nuovoPrivilegioClasse.nome} onChange={(e) => setNuovoPrivilegioClasse({ ...nuovoPrivilegioClasse, nome: e.target.value })} />
              <input style={styles.formInput} placeholder="Descrizione" value={nuovoPrivilegioClasse.desc} onChange={(e) => setNuovoPrivilegioClasse({ ...nuovoPrivilegioClasse, desc: e.target.value })} />
              <button style={styles.smallBtn} onClick={aggiungiPrivilegioClasseManuale}>+ Aggiungi</button>
            </div>
          </div>

          <div>
            <div style={styles.sectionLabel}>Tratti Razziali <button style={styles.smallBtn} onClick={sincronizzaTrattiRazziali}>🔄 Sincronizza</button></div>
            <div style={styles.hint}>Tratti automatici di razza e sottorazza, più eventuali voci manuali. Puoi collegare ognuno a un bonus numerico che influisce sui calcoli.</div>
            <div style={styles.itemList}>
              {pg.trattiRazziali.map((e) => (
                <div
                  key={e.id}
                  style={{ ...styles.abilitaExtraRow, ...(draggedTratto === e.id ? styles.tabBtnDragging : {}) }}
                  draggable
                  onDragStart={() => setDraggedTratto(e.id)}
                  onDragOver={(ev) => ev.preventDefault()}
                  onDrop={() => spostaTrattoRazziale(e.id)}
                  onDragEnd={() => setDraggedTratto(null)}
                >
                  <span style={styles.dragHandle} title="Trascina per riordinare">⠿</span>
                  <div style={{ flex: 1 }}>
                    <input style={styles.traitTitleInput} value={e.nome} onChange={(ev) => aggiornaTrattoRazziale(e.id, { nome: ev.target.value })} />
                    <div style={styles.traitSource}>{nomeFonte(e.fonte)}</div>
                    <AutoTextarea style={styles.traitDescInput} value={e.desc} onChange={(ev) => aggiornaTrattoRazziale(e.id, { desc: ev.target.value })} />
                  </div>
                  <select style={styles.applicaASelect} value={e.applicaA} onChange={(ev) => aggiornaTrattoRazziale(e.id, { applicaA: ev.target.value })}>
                    {APPLICA_A_OPTIONS(skills).map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                  {e.applicaA !== "nessuno" && <NumInput min={-20} max={20} style={styles.smallNumInput} value={e.valore} onCommit={(n) => aggiornaTrattoRazziale(e.id, { valore: n })} />}
                  <button style={styles.pgDelBtn} onClick={() => rimuoviTrattoRazziale(e.id)}>✕</button>
                </div>
              ))}
            </div>
            <div style={styles.formRow}>
              <input style={styles.formInput} placeholder="Nome tratto manuale" value={nuovoTrattoRazziale.nome} onChange={(e) => setNuovoTrattoRazziale({ ...nuovoTrattoRazziale, nome: e.target.value })} />
              <input style={styles.formInput} placeholder="Descrizione" value={nuovoTrattoRazziale.desc} onChange={(e) => setNuovoTrattoRazziale({ ...nuovoTrattoRazziale, desc: e.target.value })} />
              <button style={styles.smallBtn} onClick={aggiungiTrattoRazzialeManuale}>+ Aggiungi</button>
            </div>
          </div>
        </div>

        <div style={styles.sectionLabel}>Equipaggiamento — Armi</div>
        <SearchAddRow query={wQuery} setQuery={setWQuery} results={wResults} onAdd={(id) => { aggiungiArma(id); setWQuery(""); }} placeholder="Cerca un'arma da aggiungere..." />
        <div style={styles.itemList}>
          {pg.armiPossedute.map(({ instId, refId, magico, rarita, modTpc, modDanno, note, dannoOverride, tipoDannoOverride, dannoExtra, tipoDannoExtra }) => { const w = armi.find((x) => x.id === refId); if (!w) return null; const senzaCompetenzaArma = w.classi && w.classi.length > 0 && !pg.classi.some((ce) => w.classi.includes(ce.classeId)); return (
            <div key={instId} style={styles.itemGroup}>
              <div style={styles.itemRow}>
                <button style={styles.itemName} onClick={() => openDetail({ type: "arma", data: w })}>{w.nome}{w.custom ? " ★" : ""}</button>
                <span style={styles.hint}>{w.danno} {w.tipoDanno}{senzaCompetenzaArma ? " · ⚠ nessuna classe ha competenza con quest'arma (il bonus di competenza non dovrebbe applicarsi)" : ""}</span>
                <ComboInput value={magico} onChangeText={(t) => aggiornaCampoArma(instId, { magico: t })} options={MAGICO_OPTIONS} datalistId={`dl-magico-${instId}`} placeholder="Magico?" style={styles.magicSelect} />
                <ComboInput value={rarita} onChangeText={(t) => aggiornaCampoArma(instId, { rarita: t })} options={RARITA_OPTIONS} datalistId={`dl-rarita-${instId}`} placeholder="Rarità" style={styles.magicSelect} />
                <label style={styles.modLabel}>Mod. TpC<NumInput min={-20} max={20} style={styles.modInput} value={modTpc || 0} onCommit={(n) => aggiornaCampoArma(instId, { modTpc: n })} /></label>
                <label style={styles.modLabel}>Mod. Danno<NumInput min={-20} max={20} style={styles.modInput} value={modDanno || 0} onCommit={(n) => aggiornaCampoArma(instId, { modDanno: n })} /></label>
                <div style={{ ...styles.itemActions, marginLeft: "auto" }}>
                  <button style={styles.smallBtn} onClick={() => attaccaConArma(w, modTpc)}>🎯 TpC</button>
                  <button style={{ ...styles.smallBtn, ...(critWeapons[instId] ? styles.smallBtnActive : {}) }} onClick={() => setCritWeapons((c) => ({ ...c, [instId]: !c[instId] }))} title="Spunta se il tiro per colpire era un 20 naturale, per raddoppiare i dadi danno">🎲 Critico?</button>
                  <button style={styles.smallBtn} onClick={() => tiraDannoArma(instId, w, modDanno, dannoOverride, dannoExtra, tipoDannoExtra)}>💥 Danno{critWeapons[instId] ? " (crit!)" : ""}</button>
                  <button style={styles.removeX} onClick={() => rimuoviArma(instId)}>✕</button>
                </div>
              </div>
              <div style={styles.overrideRow}>
                <span style={styles.overrideLabel}>Versione speciale (opzionale):</span>
                <input style={styles.overrideInput} placeholder={`Dadi danno (default ${w.danno})`} value={dannoOverride || ""} onChange={(e) => aggiornaCampoArma(instId, { dannoOverride: e.target.value })} />
                <ComboInput value={tipoDannoOverride || ""} onChangeText={(t) => aggiornaCampoArma(instId, { tipoDannoOverride: t })} options={TIPO_DANNO_OPTIONS} datalistId={`dl-tipodanno-${instId}`} placeholder={`Tipo danno (default ${w.tipoDanno})`} style={styles.overrideInput} />
              </div>
              <div style={styles.overrideRow}>
                <span style={styles.overrideLabel}>Danno aggiuntivo di tipo diverso (opzionale, es. arma fiammeggiante):</span>
                <input style={styles.overrideInput} placeholder="Dadi extra (es. 2d6)" value={dannoExtra || ""} onChange={(e) => aggiornaCampoArma(instId, { dannoExtra: e.target.value })} />
                <ComboInput value={tipoDannoExtra || ""} onChangeText={(t) => aggiornaCampoArma(instId, { tipoDannoExtra: t })} options={TIPO_DANNO_OPTIONS} datalistId={`dl-tipodannoextra-${instId}`} placeholder="Tipo del danno extra" style={styles.overrideInput} />
              </div>
              <div style={styles.overrideLabel}>Effetti, appunti e altri dettagli personalizzati:</div>
              <AutoTextarea style={styles.itemNoteInput} placeholder="Es. su un colpo critico il bersaglio deve superare un TS o essere spaventato..." value={note || ""} onChange={(e) => aggiornaCampoArma(instId, { note: e.target.value })} />
            </div>
          ); })}
        </div>

        <div style={styles.sectionLabel}>Equipaggiamento — Armature</div>
        <SearchAddRow query={aQuery} setQuery={setAQuery} results={aResults} onAdd={(id) => { aggiungiArmatura(id); setAQuery(""); }} placeholder="Cerca un'armatura da aggiungere..." />
        <div style={styles.itemList}>
          {pg.armaturePossedute.map(({ instId, refId, magico, rarita, note, caOverride, maxDexOverride, forzaMinOverride }) => { const a = armature.find((x) => x.id === refId); if (!a) return null; const indossata = pg.armaturaIndossataInstId === instId; return (
            <div key={instId} style={styles.itemGroup}>
              <div style={styles.itemRow}>
                <button style={styles.itemName} onClick={() => openDetail({ type: "armatura", data: a })}>{a.nome}{a.custom ? " ★" : ""}</button>
                <span style={styles.hint}>CA {a.ca} · {a.tipo}</span>
                <ComboInput value={magico} onChangeText={(t) => aggiornaCampoArmatura(instId, { magico: t })} options={MAGICO_OPTIONS} datalistId={`dl-magico-${instId}`} placeholder="Magico?" style={styles.magicSelect} />
                <ComboInput value={rarita} onChangeText={(t) => aggiornaCampoArmatura(instId, { rarita: t })} options={RARITA_OPTIONS} datalistId={`dl-rarita-${instId}`} placeholder="Rarità" style={styles.magicSelect} />
                <div style={styles.itemActions}>
                  <button style={{ ...styles.smallBtn, ...(indossata ? styles.smallBtnActive : {}) }} onClick={() => updatePg({ armaturaIndossataInstId: indossata ? null : instId })}>{indossata ? "✓ Indossata" : "Indossa"}</button>
                  <button style={styles.smallDangerBtn} onClick={() => rimuoviArmatura(instId)}>Rimuovi</button>
                </div>
              </div>
              <div style={styles.overrideRow}>
                <span style={styles.overrideLabel}>Versione speciale (opzionale):</span>
                <input style={{ ...styles.overrideInput, minWidth: 90 }} placeholder={`CA base (default ${a.ca})`} value={caOverride ?? ""} onChange={(e) => aggiornaCampoArmatura(instId, { caOverride: e.target.value === "" ? null : e.target.value })} />
                <input style={{ ...styles.overrideInput, minWidth: 90 }} placeholder={`Tetto DES (default ${a.maxDex === null ? "nessuno" : a.maxDex})`} value={maxDexOverride ?? ""} onChange={(e) => aggiornaCampoArmatura(instId, { maxDexOverride: e.target.value === "" ? null : e.target.value })} />
                <input style={{ ...styles.overrideInput, minWidth: 110 }} placeholder={`Requisito Forza (default ${a.forzaMin ?? "nessuno"})`} value={forzaMinOverride ?? ""} onChange={(e) => aggiornaCampoArmatura(instId, { forzaMinOverride: e.target.value === "" ? null : e.target.value })} />
              </div>
              <div style={styles.overrideLabel}>Effetti, appunti e altri dettagli personalizzati:</div>
              <AutoTextarea style={styles.itemNoteInput} placeholder="Es. una volta al giorno dona vantaggio ai TS contro la paura..." value={note || ""} onChange={(e) => aggiornaCampoArmatura(instId, { note: e.target.value })} />
            </div>
          ); })}
        </div>

        <div style={styles.sectionLabel}>Equipaggiamento — Accessori</div>
        <SearchAddRow query={accQuery} setQuery={setAccQuery} results={accResults} onAdd={(id) => { aggiungiAccessorio(id); setAccQuery(""); }} placeholder="Cerca un accessorio da aggiungere..." />
        <div style={styles.itemList}>
          {pg.accessoriPosseduti.map(({ instId, refId, magico, rarita, note }) => { const a = accessori.find((x) => x.id === refId); if (!a) return null; return (
            <div key={instId} style={styles.itemGroup}>
              <div style={styles.itemRow}>
                <button style={styles.itemName} onClick={() => openDetail({ type: "accessorio", data: a })}>{a.nome}{a.custom ? " ★" : ""}</button>
                <span style={styles.hint}>effetto descrittivo</span>
                <ComboInput value={magico} onChangeText={(t) => aggiornaCampoAccessorio(instId, { magico: t })} options={MAGICO_OPTIONS} datalistId={`dl-magico-${instId}`} placeholder="Magico?" style={styles.magicSelect} />
                <ComboInput value={rarita} onChangeText={(t) => aggiornaCampoAccessorio(instId, { rarita: t })} options={RARITA_OPTIONS} datalistId={`dl-rarita-${instId}`} placeholder="Rarità" style={styles.magicSelect} />
                <div style={styles.itemActions}><button style={styles.smallDangerBtn} onClick={() => rimuoviAccessorio(instId)}>Rimuovi</button></div>
              </div>
              <AutoTextarea style={styles.itemNoteInput} placeholder="Note personalizzate su questo oggetto..." value={note || ""} onChange={(e) => aggiornaCampoAccessorio(instId, { note: e.target.value })} />
            </div>
          ); })}
        </div>

        <div style={styles.sectionLabel}>Inventario</div>
        <div style={styles.hint}>Oggetti generici: nome, quantità e dove si trovano (es. "Zaino", "Sella del cavallo"...).</div>
        <div style={styles.invTable}>
          {pg.inventario.map((v) => (
            <div
              key={v.id}
              style={{ ...styles.invRow, ...(draggedInv === v.id ? styles.tabBtnDragging : {}) }}
              draggable
              onDragStart={() => setDraggedInv(v.id)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => spostaVoceInventario(v.id)}
              onDragEnd={() => setDraggedInv(null)}
            >
              <span style={styles.dragHandle} title="Trascina per riordinare">⠿</span>
              <AutoTextarea style={styles.invNome} placeholder="Oggetto" value={v.nome} onChange={(e) => aggiornaVoceInventario(v.id, { nome: e.target.value })} />
              <NumInput min={0} max={999} style={styles.invQty} value={v.quantita} onCommit={(n) => aggiornaVoceInventario(v.id, { quantita: n })} />
              <ComboInput value={v.posizione} onChangeText={(t) => aggiornaVoceInventario(v.id, { posizione: t })} options={POSIZIONE_OPTIONS} datalistId={`dl-posizione-${v.id}`} placeholder="Posizione" style={styles.invPos} />
              <button style={styles.pgDelBtn} onClick={() => rimuoviVoceInventario(v.id)}>✕</button>
            </div>
          ))}
        </div>
        <button style={styles.newPgBtn} onClick={aggiungiVoceInventario}>+ Aggiungi oggetto all'inventario</button>

        <div style={styles.sectionLabel}>Soldi</div>
        <div style={styles.hint}>Scrivi quanto hai speso o ricavato in ciascuna valuta: "In Possesso" si aggiorna da solo, ma resta modificabile a mano in qualsiasi momento.</div>
        <div style={styles.invTable}>
          <div style={{ ...styles.invRow, marginTop: 10 }}>
            <div style={{ ...styles.moneyCatInput, ...styles.tableHeaderCell }}>Categoria</div>
            <div style={{ ...styles.moneyNumLabel, ...styles.tableHeaderCell }}>Speso</div>
            <div style={{ ...styles.moneyNumLabel, ...styles.tableHeaderCell }}>Ricavato</div>
            <div style={{ ...styles.moneyNumLabel, ...styles.tableHeaderCell }}>In Possesso</div>
            <div style={styles.invSpacer} />
          </div>
          {pg.valute.map((v) => (
            <div key={v.id} style={styles.invRow}>
              <input style={styles.moneyCatInput} value={v.categoria} onChange={(e) => aggiornaCategoriaValuta(v.id, e.target.value)} placeholder="Categoria" />
              <NumInput min={0} max={999999} style={styles.moneyNum} value={v.speso} onCommit={(n) => onSpesoChange(v.id, n)} />
              <NumInput min={0} max={999999} style={styles.moneyNum} value={v.ricavato} onCommit={(n) => onRicavatoChange(v.id, n)} />
              <NumInput min={-999999} max={999999} style={styles.moneyNumGold} value={v.inPossesso} onCommit={(n) => onInPossessoChange(v.id, n)} />
              <button style={styles.pgDelBtn} onClick={() => rimuoviValuta(v.id)}>✕</button>
            </div>
          ))}
        </div>
        <button style={styles.newPgBtn} onClick={aggiungiValuta}>+ Aggiungi valuta</button>

        <div style={{ ...styles.sectionDivider, marginBottom: 16 }} />

        {(classiIncantatrici.length > 0 || pg.mostraSlotIncantesimi) ? (
          <>
            <div style={{ ...styles.sectionLabel, borderTop: "none", paddingTop: 0, marginTop: 0 }}>Slot Incantesimo & Punti Stregoneria <button style={styles.smallBtn} onClick={sincronizzaSlot}>🔄 Sincronizza da Classe</button></div>
            <div style={styles.slotTwoColLayout}>
              <div style={styles.slotGridRows}>
                <div style={styles.slotGrid}>
                  {pg.slotIncantesimo.filter((s) => s.livello <= 5).map((s) => (
                    <div key={s.livello} style={styles.slotCol}>
                      <div style={styles.slotColTitle}>{s.livello}° Lvl</div>
                      <NumInput min={0} max={20} style={styles.slotTotaliInput} value={s.totali} onCommit={(n) => aggiornaSlot(s.livello, { totali: n, usati: Math.min(s.usati, n) })} />
                      <div style={styles.slotCheckRow}>
                        {s.totali > 0 ? Array.from({ length: s.totali }, (_, i) => (
                          <button key={i} style={{ ...styles.slotCheckbox, ...(i < s.usati ? styles.slotCheckboxUsed : {}) }} onClick={() => aggiornaSlot(s.livello, { usati: i < s.usati ? i : i + 1 })} title="Segna/togli come usato" />
                        )) : <span style={styles.slotEmptyHint}>—</span>}
                      </div>
                    </div>
                  ))}
                </div>
                <div style={styles.slotGrid}>
                  {pg.slotIncantesimo.filter((s) => s.livello >= 6).map((s) => (
                    <div key={s.livello} style={styles.slotCol}>
                      <div style={styles.slotColTitle}>{s.livello}° Lvl</div>
                      <NumInput min={0} max={20} style={styles.slotTotaliInput} value={s.totali} onCommit={(n) => aggiornaSlot(s.livello, { totali: n, usati: Math.min(s.usati, n) })} />
                      <div style={styles.slotCheckRow}>
                        {s.totali > 0 ? Array.from({ length: s.totali }, (_, i) => (
                          <button key={i} style={{ ...styles.slotCheckbox, ...(i < s.usati ? styles.slotCheckboxUsed : {}) }} onClick={() => aggiornaSlot(s.livello, { usati: i < s.usati ? i : i + 1 })} title="Segna/togli come usato" />
                        )) : <span style={styles.slotEmptyHint}>—</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div style={styles.slotStregDivider}>
                {incantesimiPreparatiConosciuti.totale > 0 && (
                  <div style={{ ...styles.slotCol, marginRight: 16 }} title={incantesimiPreparatiConosciuti.dettaglio.join(" · ")}>
                    <div style={styles.slotColTitle}>Prep.</div>
                    <NumInput min={0} max={99} style={styles.slotTotaliInput} value={pg.incantesimiPreparatiOverride ?? incantesimiPreparatiConosciuti.totale} onCommit={(n) => updatePg({ incantesimiPreparatiOverride: n })} />
                    {pg.incantesimiPreparatiOverride !== null && pg.incantesimiPreparatiOverride !== undefined ? (
                      <button style={styles.resetOverrideBtn} title="Torna al calcolo automatico" onClick={() => updatePg({ incantesimiPreparatiOverride: null })}>⟳ auto</button>
                    ) : (
                      <div style={styles.slotEmptyHint}>auto</div>
                    )}
                  </div>
                )}
                <div style={styles.slotCol}>
                  <div style={styles.slotColTitle}>P. Streg.</div>
                  <NumInput min={0} max={20} style={styles.slotTotaliInput} value={pg.puntiStregoneria.totali} onCommit={(n) => aggiornaPuntiStregoneria({ totali: n, usati: Math.min(pg.puntiStregoneria.usati, n) })} />
                  <div style={styles.slotCheckRow}>
                    {pg.puntiStregoneria.totali > 0 ? Array.from({ length: pg.puntiStregoneria.totali }, (_, i) => (
                      <button key={i} style={{ ...styles.slotCheckbox, ...(i < pg.puntiStregoneria.usati ? styles.slotCheckboxUsed : {}) }} onClick={() => aggiornaPuntiStregoneria({ usati: i < pg.puntiStregoneria.usati ? i : i + 1 })} title="Segna/togli come usato" />
                    )) : <span style={styles.slotEmptyHint}>—</span>}
                  </div>
                </div>
              </div>
            </div>
            <div style={styles.hint}>Scrivi il totale nel box tondo e premi Invio: compariranno i quadratini da cliccare per segnare quanti ne hai usati (clicca di nuovo per togliere il segno). "Prep." (Preparati/Conosciuti) è calcolato in automatico dalle regole della tua classe (passa il mouse sopra per il dettaglio).</div>
            {!classiIncantatrici.length && <button style={{ ...styles.smallBtn, marginTop: 10 }} onClick={() => updatePg({ mostraSlotIncantesimi: false })}>Nascondi (nessuna classe incantatrice)</button>}
          </>
        ) : (
          <div style={styles.hint}>Slot Incantesimo & Punti Stregoneria nascosti (nessuna classe incantatrice). <button style={styles.smallBtn} onClick={() => updatePg({ mostraSlotIncantesimi: true })}>Mostra comunque</button></div>
        )}

        {(classiIncantatrici.length > 0 || pg.mostraIncantesimiNoti || INCANTESIMI_RAZZIALI[pg.razzaId] || INCANTESIMI_RAZZIALI[pg.sottorazzaId] || pg.classi.some((ce) => INCANTESIMI_SOTTOCLASSE[ce.sottoclasseId])) ? (
          <>
            <div style={styles.sectionLabel}>Incantesimi noti {classePrimaria?.caster && <span style={styles.hint}>({ABILITY_LABELS[classePrimaria.caster]}, mod. {fmt(modByAb[classePrimaria.caster])}, CD {8 + profBonus + modByAb[classePrimaria.caster]})</span>} <button style={styles.smallBtn} onClick={() => { sincronizzaIncantesimiRazza(); sincronizzaIncantesimiSottoclasse(); }}>🔄 Aggiungi da razza/sottoclasse</button></div>
            <div style={styles.hint}>Il tasto aggiunge automaticamente gli incantesimi innati di razza (es. Tiefling, Aasimar, Elfo Scuro) e quelli "sempre pronti" concessi da Domini/Giuramenti/Patroni, senza contare nel numero di Prep./Conosciuti.</div>
            <SearchAddRow query={spellQuery} setQuery={setSpellQuery} results={spellResults} onAdd={(id) => { aggiungiIncantesimo(id); setSpellQuery(""); }} placeholder="Cerca un incantesimo per nome o scuola..." />
            <div style={styles.itemList}>
              {pg.incantesimiNoti.map((id) => { const s = incantesimi.find((x) => x.id === id); if (!s) return null; const puoUpcastare = s.livello > 0 && (s.danno || s.cura); const livelloLancio = pg.incantesimiLivelloLancio?.[id] || s.livello; const extraInfo = pg.incantesimiDannoExtra?.[id] || {}; return (
                <div key={id} style={styles.itemGroup}>
                  <div style={styles.itemRow}>
                    <button style={styles.itemName} onClick={() => openDetail({ type: "incantesimo", data: s })}>{s.nome}{s.custom ? " ★" : ""}</button>
                    <span style={styles.hint}>{s.livello === 0 ? "Trucchetto" : `Livello ${s.livello}`} · {s.scuola}</span>
                    {puoUpcastare && (
                      <label style={styles.modLabel}>Lancia a liv.
                        <NumInput min={s.livello} max={9} style={styles.modInput} value={livelloLancio} onCommit={(n) => updatePg({ incantesimiLivelloLancio: { ...pg.incantesimiLivelloLancio, [id]: Math.max(s.livello, Math.min(9, n)) } })} />
                      </label>
                    )}
                    <div style={styles.itemActions}>
                      {s.attacco && <button style={styles.smallBtn} onClick={() => attaccaConIncantesimo(s)}>🎯 TpC</button>}
                      {s.attacco && s.danno && <button style={{ ...styles.smallBtn, ...(critSpells[id] ? styles.smallBtnActive : {}) }} onClick={() => setCritSpells((c) => ({ ...c, [id]: !c[id] }))} title="Spunta se il tiro per colpire era un 20 naturale, per raddoppiare i dadi danno">🎲 Critico?</button>}
                      {(s.danno || s.cura) && <button style={styles.smallBtn} onClick={() => tiraDannoIncantesimo(id, s, extraInfo.notazione, extraInfo.tipo)}>{s.cura ? "💚 Cura" : `💥 Danno${critSpells[id] ? " (crit!)" : ""}`}</button>}
                      <button style={styles.smallDangerBtn} onClick={() => rimuoviIncantesimo(id)}>Rimuovi</button>
                    </div>
                  </div>
                  {s.danno && (
                    <div style={styles.overrideRow}>
                      <span style={styles.overrideLabel}>Danno aggiuntivo di tipo diverso (opzionale, es. da un oggetto magico):</span>
                      <input style={styles.overrideInput} placeholder="Dadi extra (es. 1d6)" value={extraInfo.notazione || ""} onChange={(e) => updatePg({ incantesimiDannoExtra: { ...pg.incantesimiDannoExtra, [id]: { ...extraInfo, notazione: e.target.value } } })} />
                      <ComboInput value={extraInfo.tipo || ""} onChangeText={(t) => updatePg({ incantesimiDannoExtra: { ...pg.incantesimiDannoExtra, [id]: { ...extraInfo, tipo: t } } })} options={TIPO_DANNO_OPTIONS} datalistId={`dl-tipodannoextra-inc-${id}`} placeholder="Tipo del danno extra" style={styles.overrideInput} />
                    </div>
                  )}
                </div>
              ); })}
            </div>
            {!classiIncantatrici.length && <button style={{ ...styles.smallBtn, marginTop: 10 }} onClick={() => updatePg({ mostraIncantesimiNoti: false })}>Nascondi (nessuna classe incantatrice)</button>}
          </>
        ) : (
          <div style={styles.hint}>Incantesimi noti nascosti (nessuna classe incantatrice). <button style={styles.smallBtn} onClick={() => updatePg({ mostraIncantesimiNoti: true })}>Mostra comunque</button></div>
        )}

        {(livelloMonaco > 0 || pg.mostraPuntiKi) && (
          <>
            <div style={styles.sectionLabel}>Punti Ki (Monaco) <button style={styles.smallBtn} onClick={sincronizzaKi}>🔄 Sincronizza da Classe</button></div>
            <div style={styles.hint}>CD Tecnica Ki: {cdKi} (8 + competenza + Saggezza) — i punti si recuperano con un riposo breve o lungo.</div>
            <div style={styles.slotCol}>
              <div style={styles.slotColTitle}>Punti Ki</div>
              <NumInput min={0} max={20} style={styles.slotTotaliInput} value={pg.puntiKi.totali} onCommit={(n) => aggiornaPuntiKi({ totali: n, usati: Math.min(pg.puntiKi.usati, n) })} />
              <div style={styles.slotCheckRow}>
                {pg.puntiKi.totali > 0 ? Array.from({ length: pg.puntiKi.totali }, (_, i) => (
                  <button key={i} style={{ ...styles.slotCheckbox, ...(i < pg.puntiKi.usati ? styles.slotCheckboxUsed : {}) }} onClick={() => aggiornaPuntiKi({ usati: i < pg.puntiKi.usati ? i : i + 1 })} title="Segna/togli come usato" />
                )) : <span style={styles.slotEmptyHint}>—</span>}
              </div>
            </div>
            {livelloMonaco === 0 && <button style={{ ...styles.smallBtn, marginTop: 10 }} onClick={() => updatePg({ mostraPuntiKi: false })}>Nascondi (nessun livello da Monaco)</button>}
          </>
        )}
        {livelloMonaco === 0 && !pg.mostraPuntiKi && (
          <div style={styles.hint}>Punti Ki nascosti (nessun livello da Monaco). <button style={styles.smallBtn} onClick={() => updatePg({ mostraPuntiKi: true })}>Mostra comunque</button></div>
        )}

        <div style={styles.sectionLabel}>Talenti</div>
        <div style={styles.itemList}>
          {pg.talenti.map((t) => (
            <div key={t.id} style={styles.abilitaExtraRow}>
              <div style={{ flex: 1 }}>
                <AutoTextarea style={{ ...styles.invNome, display: "block", width: "100%", marginBottom: 8 }} placeholder="Nome talento" value={t.nome} onChange={(e) => aggiornaTalento(t.id, { nome: e.target.value })} />
                <AutoTextarea style={{ ...styles.invNome, display: "block", width: "100%" }} placeholder="Descrizione" value={t.desc} onChange={(e) => aggiornaTalento(t.id, { desc: e.target.value })} />
              </div>
              <select style={styles.applicaASelect} value={t.applicaA} onChange={(e) => aggiornaTalento(t.id, { applicaA: e.target.value })}>
                {APPLICA_A_OPTIONS(skills).map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              {t.applicaA !== "nessuno" && <NumInput min={-20} max={20} style={styles.smallNumInput} value={t.valore} onCommit={(n) => aggiornaTalento(t.id, { valore: n })} />}
              <button style={styles.pgDelBtn} onClick={() => rimuoviTalento(t.id)}>✕</button>
            </div>
          ))}
        </div>
        <button style={styles.newPgBtn} onClick={aggiungiTalento}>+ Aggiungi talento</button>

        <div style={styles.sectionLabel}>Note personali</div>
        <textarea style={styles.notes} value={pg.note} onChange={(e) => updatePg({ note: e.target.value })} placeholder="Background, oggetti unici, alleanze..." />

        <div style={styles.sectionLabel}>Info Extra</div>
        <div style={styles.invTable}>
          <div style={styles.invRow}>
            <div style={{ ...styles.invNome, ...styles.tableHeaderCell }}>Campo</div>
            <div style={{ ...styles.invPos, ...styles.tableHeaderCell }}>Descrizione</div>
            <div style={styles.invSpacer} />
          </div>
          {pg.classi.map((ce) => {
            const c = classi.find((x) => x.id === ce.classeId);
            if (!c) return null;
            return (
              <div key={ce.instId} style={styles.invRow}>
                <div style={styles.invNome}>Dado Vita — {c.nome}</div>
                <div style={styles.invPos}>{`d${c.dado} (livello ${ce.livello})`}</div>
                <div style={styles.invSpacer} />
              </div>
            );
          })}
          {(() => {
            const bonusSkill = (nome) => { const comp = pg.abilitaCompetenti.includes(nome); const esperto = pg.abilitaEsperte.includes(nome); return esperto ? profBonus * 2 : comp ? profBonus : 0; };
            const percezionePassiva = 10 + modByAb.SAG + bonusSkill("Percezione") + bonusExtra("SKILL_Percezione");
            const indagarePassivo = 10 + modByAb.INT + bonusSkill("Investigare") + bonusExtra("SKILL_Investigare");
            return (
              <>
                <div style={styles.invRow}>
                  <div style={styles.invNome}>Percezione Passiva</div>
                  <div style={styles.invPos}>{percezionePassiva}</div>
                  <div style={styles.invSpacer} />
                </div>
                <div style={styles.invRow}>
                  <div style={styles.invNome}>Indagare Passivo</div>
                  <div style={styles.invPos}>{indagarePassivo}</div>
                  <div style={styles.invSpacer} />
                </div>
              </>
            );
          })()}
          {razza && (
            <>
              <div style={styles.invRow}><div style={styles.invNome}>Tipo di Visione</div><div style={styles.invPos}>{razza.visione}</div><div style={styles.invSpacer} /></div>
              <div style={styles.invRow}><div style={styles.invNome}>Vantaggi (da razza)</div><div style={styles.invPos}>{razza.vantaggi}</div><div style={styles.invSpacer} /></div>
              <div style={styles.invRow}><div style={styles.invNome}>Resistenze (da razza)</div><div style={styles.invPos}>{razza.resistenze}</div><div style={styles.invSpacer} /></div>
              <div style={styles.invRow}><div style={styles.invNome}>Immunità (da razza)</div><div style={styles.invPos}>{razza.immunita}</div><div style={styles.invSpacer} /></div>
            </>
          )}
          {livelloPaladino > 0 && (
            <div style={styles.invRow}>
              <div style={styles.invNome}>Imposizione delle Mani <button style={{ ...styles.smallBtn, marginLeft: 8 }} onClick={() => updatePg({ imposizioneMani: { rimanenti: livelloPaladino * 5, totali: livelloPaladino * 5 } })} title="Reimposta al massimo (5 x livello da Paladino)">🔄</button></div>
              <div style={{ ...styles.invPos, display: "flex", alignItems: "center", gap: 6 }}>
                <NumInput min={0} max={999} style={styles.invQty} value={pg.imposizioneMani?.rimanenti ?? 0} onCommit={(n) => updatePg({ imposizioneMani: { ...pg.imposizioneMani, rimanenti: n } })} />
                <span>/</span>
                <NumInput min={0} max={999} style={styles.invQty} value={pg.imposizioneMani?.totali ?? 0} onCommit={(n) => updatePg({ imposizioneMani: { ...pg.imposizioneMani, totali: n } })} />
              </div>
              <div style={styles.invSpacer} />
            </div>
          )}
          {pg.classi.some((ce) => ce.sottoclasseId === "patrono_genio") && (
            <div style={styles.invRow}>
              <div style={styles.invNome}>Tipo di Genio</div>
              <select style={styles.invPos} value={pg.genioTipo || ""} onChange={(e) => updatePg({ genioTipo: e.target.value })}>
                <option value="">Scegli...</option>
                <option value="Dao">Dao (Terra)</option>
                <option value="Djinni">Djinni (Aria)</option>
                <option value="Efreeti">Efreeti (Fuoco)</option>
                <option value="Marid">Marid (Acqua)</option>
              </select>
              <div style={styles.invSpacer} />
            </div>
          )}
          {livelloArtificiere > 0 && (
            <div style={styles.invRow}>
              <button style={{ ...styles.invNome, cursor: "pointer", textDecoration: "underline", textAlign: "left", display: "block", width: "100%", boxSizing: "border-box", fontFamily: "inherit" }} onClick={() => setMostraFinestraInfusioni(true)} title="Apri l'elenco completo delle Infusioni conosciute">Infusioni 📖</button>
              <AutoTextarea style={styles.invPos} placeholder="Scrivi qui quali infusioni conosci e su quali oggetti le hai applicate..." value={pg.infusioniTestoLibero || ""} onChange={(e) => updatePg({ infusioniTestoLibero: e.target.value })} />
              <div style={styles.invSpacer} />
            </div>
          )}
          {pg.infoExtra.map((v) => (
            <div key={v.id} style={styles.invRow}>
              <AutoTextarea style={styles.invNome} placeholder="Campo (es. Allineamento)" value={v.chiave} onChange={(e) => aggiornaInfoExtra(v.id, { chiave: e.target.value })} />
              <AutoTextarea style={styles.invPos} placeholder="Descrizione" value={v.valore} onChange={(e) => aggiornaInfoExtra(v.id, { valore: e.target.value })} />
              <button style={styles.pgDelBtn} onClick={() => rimuoviInfoExtra(v.id)}>✕</button>
            </div>
          ))}
        </div>
        <button style={styles.newPgBtn} onClick={aggiungiInfoExtra}>+ Aggiungi campo Info Extra</button>

        <div style={{ ...styles.sectionDivider, marginBottom: 16 }} />

        <div style={{ ...styles.sectionLabel, borderTop: "none", paddingTop: 0, marginTop: 0 }}>Competenze Generiche</div>
        <div style={styles.hint}>Strumenti, kit e veicoli con cui hai competenza. Spunta quelle che hai, o aggiungine una personalizzata se manca dalla lista.</div>
        {["Strumenti da Artigiano", "Kit Speciali", "Giochi e Musica", "Veicoli"].map((cat) => (
          <div key={cat} style={{ marginBottom: 10 }}>
            <div style={styles.columnTitleLeft}>{cat}</div>
            <div style={styles.cardGrid}>
              {competenzeGenericheCatalogo.filter((c) => c.categoria === cat).map((c) => {
                const checked = pg.competenzeGeneriche.includes(c.id);
                return (
                  <label key={c.id} style={styles.checkField}>
                    <input type="checkbox" checked={checked} onChange={() => updatePg({ competenzeGeneriche: checked ? pg.competenzeGeneriche.filter((x) => x !== c.id) : [...pg.competenzeGeneriche, c.id] })} />
                    {c.nome}
                  </label>
                );
              })}
            </div>
          </div>
        ))}
        <div style={styles.hint}>Non trovi quella che cerchi?</div>
        <input
          style={styles.formInput}
          placeholder="Aggiungi una nuova competenza personalizzata e premi Invio..."
          onKeyDown={(e) => {
            if (e.key === "Enter" && e.target.value.trim()) {
              const nome = e.target.value.trim();
              const id = uid();
              setCompetenzeGenericheCatalogo((s) => [...s, { id, nome, categoria: "Personalizzate", custom: true }]);
              updatePg({ competenzeGeneriche: [...pg.competenzeGeneriche, id] });
              e.target.value = "";
            }
          }}
        />
        {competenzeGenericheCatalogo.some((c) => c.categoria === "Personalizzate") && (
          <div style={{ marginTop: 8 }}>
            <div style={styles.columnTitleLeft}>Personalizzate</div>
            <div style={styles.cardGrid}>
              {competenzeGenericheCatalogo.filter((c) => c.categoria === "Personalizzate").map((c) => {
                const checked = pg.competenzeGeneriche.includes(c.id);
                return (
                  <label key={c.id} style={styles.checkField}>
                    <input type="checkbox" checked={checked} onChange={() => updatePg({ competenzeGeneriche: checked ? pg.competenzeGeneriche.filter((x) => x !== c.id) : [...pg.competenzeGeneriche, c.id] })} />
                    {c.nome}
                    <button style={styles.pgDelBtn} onClick={() => { setCompetenzeGenericheCatalogo((s) => s.filter((x) => x.id !== c.id)); updatePg({ competenzeGeneriche: pg.competenzeGeneriche.filter((x) => x !== c.id) }); }}>✕</button>
                  </label>
                );
              })}
            </div>
          </div>
        )}

        <div style={styles.columnTitleLeft}>Equipaggiamento — Competenze <button style={styles.smallBtn} onClick={sincronizzaCompetenzeEquip}>🔄 Sincronizza da Classe</button></div>
        <div style={styles.hint}>Le checkbox si pre-compilano in base alla classe (o classi, in caso di multiclasse), ma restano sempre modificabili a mano.</div>
        <div style={styles.twoCol}>
          <div>
            <div style={styles.columnTitleLeft}>Armature</div>
            <label style={{ ...styles.checkField, marginBottom: 6 }}><input type="checkbox" checked={pg.compArmature?.leggera || false} onChange={(e) => updatePg({ compArmature: { ...pg.compArmature, leggera: e.target.checked } })} />Leggera</label>
            <label style={{ ...styles.checkField, marginBottom: 6 }}><input type="checkbox" checked={pg.compArmature?.media || false} onChange={(e) => updatePg({ compArmature: { ...pg.compArmature, media: e.target.checked } })} />Media</label>
            <label style={{ ...styles.checkField, marginBottom: 6 }}><input type="checkbox" checked={pg.compArmature?.pesante || false} onChange={(e) => updatePg({ compArmature: { ...pg.compArmature, pesante: e.target.checked } })} />Pesante</label>
            <label style={styles.checkField}><input type="checkbox" checked={pg.compScudi || false} onChange={(e) => updatePg({ compScudi: e.target.checked })} />Scudi</label>
          </div>
          <div>
            <div style={styles.columnTitleLeft}>Armi</div>
            <label style={{ ...styles.checkField, marginBottom: 6 }}><input type="checkbox" checked={pg.compArmi?.improvvisata || false} onChange={(e) => updatePg({ compArmi: { ...pg.compArmi, improvvisata: e.target.checked } })} />Improvvisate</label>
            <label style={{ ...styles.checkField, marginBottom: 6 }}><input type="checkbox" checked={pg.compArmi?.semplice || false} onChange={(e) => updatePg({ compArmi: { ...pg.compArmi, semplice: e.target.checked } })} />Semplici</label>
            <label style={styles.checkField}><input type="checkbox" checked={pg.compArmi?.daGuerra || false} onChange={(e) => updatePg({ compArmi: { ...pg.compArmi, daGuerra: e.target.checked } })} />Da Guerra</label>
          </div>
        </div>
      </section>

      {mostraFinestraInfusioni && (
        <div style={styles.overlay} onClick={() => setMostraFinestraInfusioni(false)}>
          <div style={{ ...styles.modalBox, maxWidth: 700, maxHeight: "80vh", overflowY: "auto" }} onClick={(e) => e.stopPropagation()}>
            <button style={styles.modalClose} onClick={() => setMostraFinestraInfusioni(false)}>✕</button>
            <h3 style={styles.modalTitle}>Infusioni dell'Artificiere</h3>
            <p style={styles.hint}>Privilegio di classe comune a tutte le sottoclassi: al 2° livello ne conosci 4, e ne impari altre salendo di livello. Puoi sostituirne una a scelta ogni volta che sali di livello. Qui sotto l'elenco completo, con il livello minimo richiesto per ciascuna.</p>
            {infusioniCatalogo.filter((i) => i.livelloMin <= Math.max(livelloArtificiere, 2)).map((i) => (
              <div key={i.id} style={styles.itemGroup}>
                <div style={styles.traitTitle}>{i.nome} <span style={styles.traitSource}>dal {i.livelloMin}° livello</span></div>
                <div style={styles.hint}><strong>Oggetto:</strong> {i.oggetto}</div>
                <div style={styles.modalDesc}>{i.desc}</div>
              </div>
            ))}
            {infusioniCatalogo.some((i) => i.livelloMin > Math.max(livelloArtificiere, 2)) && (
              <>
                <div style={{ ...styles.columnTitleLeft, opacity: 0.6 }}>Non ancora disponibili al tuo livello</div>
                {infusioniCatalogo.filter((i) => i.livelloMin > Math.max(livelloArtificiere, 2)).map((i) => (
                  <div key={i.id} style={{ ...styles.itemGroup, opacity: 0.5 }}>
                    <div style={styles.traitTitle}>{i.nome} <span style={styles.traitSource}>dal {i.livelloMin}° livello</span></div>
                    <div style={styles.hint}><strong>Oggetto:</strong> {i.oggetto}</div>
                    <div style={styles.modalDesc}>{i.desc}</div>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}


export default SchedeTab;
