import React, { useState, useMemo, useRef } from 'react';
import { styles, palette } from '../styles.js';
import { ABILITIES, ABILITY_LABELS, mod, fmt, zeroBonus, uid, PROF_BONUS_BY_LEVEL, nomeFonte, APPLICA_A_OPTIONS, MAGICO_OPTIONS, RARITA_OPTIONS } from '../utils/helpers.js';
import { TABELLA_SLOT_PIENI, TABELLA_PATTO_WARLOCK, puntiStregoneriaPerLivello } from '../utils/spellSlots.js';
import { ComboInput, NumInput, AutoTextarea, StatBox, SearchAddRow } from './shared.jsx';


function SchedeTab({ personaggi, attivoId, setAttivoId, aggiungiPg, rimuoviPg, pg, updatePg, skills, setSkills, razze, sottorazze, classi, sottoclassi, armi, armature, accessori, incantesimi, openD20Roll, openDiceRoll, openDetail, onEsportaPg, onImportaPg }) {
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
  const classiIncantatrici = pg.classi
    .map((ce) => classi.find((c) => c.id === ce.classeId))
    .filter((c) => c && c.caster)
    .filter((c, idx, arr) => arr.findIndex((x) => x.id === c.id) === idx);

  const bonusExtra = (tipo) => [...pg.trattiRazziali, ...pg.privilegiClasse, ...pg.talenti].filter((e) => e.applicaA === tipo).reduce((s, e) => s + Number(e.valore || 0), 0);

  const armaturaEquipRef = pg.armaturePossedute.find((x) => x.instId === pg.armaturaIndossataInstId);
  const armaturaEquip = armaturaEquipRef ? armature.find((a) => a.id === armaturaEquipRef.refId) : null;
  const caCalcolata = useMemo(() => {
    if (pg.caOverride !== null && pg.caOverride !== undefined && pg.caOverride !== "") return Number(pg.caOverride);
    let base = 10 + modByAb.DES;
    if (armaturaEquip) { const cap = armaturaEquip.maxDex === null ? modByAb.DES : Math.min(modByAb.DES, armaturaEquip.maxDex); base = armaturaEquip.ca + cap; }
    if (pg.scudo) base += 2;
    return base + bonusExtra("CA");
  }, [pg.caOverride, pg.scudo, armaturaEquip, modByAb.DES, pg.trattiRazziali, pg.privilegiClasse]);

  const iniziativa = modByAb.DES + Number(pg.iniziativaBonus || 0) + bonusExtra("Iniziativa");

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

  const [wQuery, setWQuery] = useState(""); const [aQuery, setAQuery] = useState(""); const [accQuery, setAccQuery] = useState("");
  const wResults = useMemo(() => (wQuery.trim() ? armi.filter((w) => w.nome.toLowerCase().includes(wQuery.toLowerCase())).slice(0, 8) : []), [wQuery, armi]);
  const aResults = useMemo(() => (aQuery.trim() ? armature.filter((a) => a.nome.toLowerCase().includes(aQuery.toLowerCase())).slice(0, 8) : []), [aQuery, armature]);
  const accResults = useMemo(() => (accQuery.trim() ? accessori.filter((a) => a.nome.toLowerCase().includes(accQuery.toLowerCase())).slice(0, 8) : []), [accQuery, accessori]);
  const aggiungiArma = (refId) => updatePg({ armiPossedute: [...pg.armiPossedute, { instId: uid(), refId, magico: "", rarita: "", modTpc: 0, modDanno: 0 }] });
  const rimuoviArma = (instId) => updatePg({ armiPossedute: pg.armiPossedute.filter((x) => x.instId !== instId) });
  const aggiornaCampoArma = (instId, patch) => updatePg({ armiPossedute: pg.armiPossedute.map((x) => (x.instId === instId ? { ...x, ...patch } : x)) });
  const aggiungiArmatura = (refId) => updatePg({ armaturePossedute: [...pg.armaturePossedute, { instId: uid(), refId, magico: "", rarita: "" }] });
  const rimuoviArmatura = (instId) => updatePg({ armaturePossedute: pg.armaturePossedute.filter((x) => x.instId !== instId), armaturaIndossataInstId: pg.armaturaIndossataInstId === instId ? null : pg.armaturaIndossataInstId });
  const aggiornaCampoArmatura = (instId, patch) => updatePg({ armaturePossedute: pg.armaturePossedute.map((x) => (x.instId === instId ? { ...x, ...patch } : x)) });
  const aggiungiAccessorio = (refId) => updatePg({ accessoriPosseduti: [...pg.accessoriPosseduti, { instId: uid(), refId, magico: "", rarita: "" }] });
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
      if (c) c.tratti.forEach((t) => out.push({ ...t, fonte: `Classe (${c.nome})` }));
      const sc = sottoclassi.find((x) => x.id === ce.sottoclasseId);
      if (sc) sc.tratti.forEach((t) => out.push({ ...t, fonte: `Sottoclasse (${sc.nome})` }));
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

  const sincronizzaSlot = () => {
    let livelloCombinato = 0;
    let warlockLivello = 0;
    let stregoneLivello = 0;
    pg.classi.forEach((ce) => {
      const c = classi.find((x) => x.id === ce.classeId);
      if (!c) return;
      const lvl = Number(ce.livello) || 0;
      if (c.id === "warlock") { warlockLivello += lvl; return; }
      if (c.id === "stregone") stregoneLivello += lvl;
      if (c.progressione === "pieno") livelloCombinato += lvl;
      else if (c.progressione === "mezzo") livelloCombinato += Math.floor(lvl / 2);
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
  const tiraDannoArma = (instId, w, modDanno) => { const abMod = weaponAbilityMod(w); const extra = Number(modDanno) || 0; openDiceRoll({ title: `Danno — ${w.nome}`, notation: w.danno, flatBonus: abMod + extra, flatBonusLabel: `modificatore caratteristica ${fmt(abMod)}${extra ? ` + Modificatore arma ${fmt(extra)}` : ""}`, doubled: !!critWeapons[instId] }); setCritWeapons((c) => ({ ...c, [instId]: false })); };
  const attaccaConIncantesimo = (s) => { if (!classePrimaria?.caster) return; const cMod = modByAb[classePrimaria.caster]; openD20Roll({ title: `TpC — ${s.nome}`, modifier: cMod + profBonus, modifierLabel: `${ABILITY_LABELS[classePrimaria.caster]} ${fmt(cMod)} + Competenza ${fmt(profBonus)}` }); };
  const tiraDannoIncantesimo = (id, s) => { const cMod = classePrimaria?.caster ? modByAb[classePrimaria.caster] : 0; if (s.cura) openDiceRoll({ title: `Cura — ${s.nome}`, notation: s.cura, flatBonus: cMod, flatBonusLabel: `caratteristica da incantatore ${fmt(cMod)}` }); else if (s.danno) { openDiceRoll({ title: `Danno — ${s.nome}`, notation: s.danno, flatBonus: 0, flatBonusLabel: "gli incantesimi di norma non aggiungono il modificatore al danno", doubled: !!critSpells[id] }); setCritSpells((c) => ({ ...c, [id]: false })); } };

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
          <StatBox label="Classe Armatura" value={caCalcolata} sub={armaturaEquip ? armaturaEquip.nome : "nessuna armatura indossata"}>
            <input placeholder="override" style={styles.smallNumInput} value={pg.caOverride ?? ""} onChange={(e) => updatePg({ caOverride: e.target.value === "" ? null : e.target.value })} />
          </StatBox>
          <StatBox label="Velocità" value={pg.velocitaOverride || razza?.velocita || "9 m"} sub={razza ? razza.nome : "valore predefinito"}>
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
        </div>
        <div style={styles.hint}>Scrivi un danno e premi Invio: viene tolto prima dai PF Temporanei, poi dagli Attuali, e sommato al totale Danni Subiti. Tutti i box restano modificabili a mano.</div>

        <div style={styles.sectionLabel}>Caratteristiche</div>
        <div style={styles.abilityGrid}>
          {ABILITIES.map((a) => {
            const bonusRazza = (razzaBonus[a] || 0) + (sottorazzaBonus[a] || 0);
            return (
              <div key={a} style={styles.abilityCard}>
                <div style={styles.abilityName}>{ABILITY_LABELS[a]}</div>
                <NumInput min={1} max={30} style={styles.abilityScoreInput} value={pg.abilita[a] + bonusRazza} onCommit={(n) => updatePg({ abilita: { ...pg.abilita, [a]: n - bonusRazza } })} />
                {bonusRazza !== 0 && <div style={styles.hint}>Include {fmt(bonusRazza)} di bonus razza</div>}
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
              const val = modByAb[a] + (comp ? profBonus : 0) + bonusExtra(`TS_${a}`);
              return (
                <label key={a} style={styles.checkRow}>
                  <input type="checkbox" checked={comp} onChange={() => toggleTiro(a)} />
                  <span style={styles.checkRowLabel}>{ABILITY_LABELS[a]}</span>
                  <span style={styles.checkRowVal}>{fmt(val)}</span>
                  <button style={styles.diceBtn} onClick={() => openD20Roll({ title: `Tiro Salvezza su ${ABILITY_LABELS[a]}`, modifier: val, modifierLabel: `${ABILITY_LABELS[a]} ${fmt(modByAb[a])}${comp ? ` + Competenza ${fmt(profBonus)}` : ""}` })}>🎲</button>
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
              const val = modByAb[s.ab] + (esperto ? profBonus * 2 : comp ? profBonus : 0) + bonusExtra(`SKILL_${s.name}`);
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
                  <span style={styles.checkRowVal}>{fmt(val)}</span>
                  <button style={styles.diceBtn} onClick={() => openD20Roll({ title: s.name, modifier: val, modifierLabel: `${ABILITY_LABELS[s.ab]} ${fmt(modByAb[s.ab])}${esperto ? " + Competenza x2 (Esperto)" : comp ? ` + Competenza ${fmt(profBonus)}` : ""}` })}>🎲</button>
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
                <div key={e.id} style={styles.abilitaExtraRow}>
                  <div style={{ flex: 1 }}>
                    <div style={styles.traitTitle}>{e.nome}</div>
                    <div style={styles.traitSource}>{nomeFonte(e.fonte)}</div>
                    <div style={styles.hint}>{e.desc}</div>
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
                <div key={e.id} style={styles.abilitaExtraRow}>
                  <div style={{ flex: 1 }}>
                    <div style={styles.traitTitle}>{e.nome}</div>
                    <div style={styles.traitSource}>{nomeFonte(e.fonte)}</div>
                    <div style={styles.hint}>{e.desc}</div>
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
          {pg.armiPossedute.map(({ instId, refId, magico, rarita, modTpc, modDanno }) => { const w = armi.find((x) => x.id === refId); if (!w) return null; return (
            <div key={instId} style={styles.itemRow}>
              <button style={styles.itemName} onClick={() => openDetail({ type: "arma", data: w })}>{w.nome}{w.custom ? " ★" : ""}</button>
              <span style={styles.hint}>{w.danno} {w.tipoDanno}</span>
              <ComboInput value={magico} onChangeText={(t) => aggiornaCampoArma(instId, { magico: t })} options={MAGICO_OPTIONS} datalistId={`dl-magico-${instId}`} placeholder="Magico?" style={styles.magicSelect} />
              <ComboInput value={rarita} onChangeText={(t) => aggiornaCampoArma(instId, { rarita: t })} options={RARITA_OPTIONS} datalistId={`dl-rarita-${instId}`} placeholder="Rarità" style={styles.magicSelect} />
              <label style={styles.modLabel}>Mod. TpC<NumInput min={-20} max={20} style={styles.modInput} value={modTpc || 0} onCommit={(n) => aggiornaCampoArma(instId, { modTpc: n })} /></label>
              <label style={styles.modLabel}>Mod. Danno<NumInput min={-20} max={20} style={styles.modInput} value={modDanno || 0} onCommit={(n) => aggiornaCampoArma(instId, { modDanno: n })} /></label>
              <div style={{ ...styles.itemActions, marginLeft: "auto" }}>
                <button style={styles.smallBtn} onClick={() => attaccaConArma(w, modTpc)}>🎯 TpC</button>
                <button style={styles.smallBtn} onClick={() => tiraDannoArma(instId, w, modDanno)}>💥 Danno{critWeapons[instId] ? " (crit!)" : ""}</button>
                <button style={styles.removeX} onClick={() => rimuoviArma(instId)}>✕</button>
              </div>
            </div>
          ); })}
        </div>

        <div style={styles.sectionLabel}>Equipaggiamento — Armature</div>
        <SearchAddRow query={aQuery} setQuery={setAQuery} results={aResults} onAdd={(id) => { aggiungiArmatura(id); setAQuery(""); }} placeholder="Cerca un'armatura da aggiungere..." />
        <div style={styles.itemList}>
          {pg.armaturePossedute.map(({ instId, refId, magico, rarita }) => { const a = armature.find((x) => x.id === refId); if (!a) return null; const indossata = pg.armaturaIndossataInstId === instId; return (
            <div key={instId} style={styles.itemRow}>
              <button style={styles.itemName} onClick={() => openDetail({ type: "armatura", data: a })}>{a.nome}{a.custom ? " ★" : ""}</button>
              <span style={styles.hint}>CA {a.ca} · {a.tipo}</span>
              <ComboInput value={magico} onChangeText={(t) => aggiornaCampoArmatura(instId, { magico: t })} options={MAGICO_OPTIONS} datalistId={`dl-magico-${instId}`} placeholder="Magico?" style={styles.magicSelect} />
              <ComboInput value={rarita} onChangeText={(t) => aggiornaCampoArmatura(instId, { rarita: t })} options={RARITA_OPTIONS} datalistId={`dl-rarita-${instId}`} placeholder="Rarità" style={styles.magicSelect} />
              <div style={styles.itemActions}>
                <button style={{ ...styles.smallBtn, ...(indossata ? styles.smallBtnActive : {}) }} onClick={() => updatePg({ armaturaIndossataInstId: indossata ? null : instId })}>{indossata ? "✓ Indossata" : "Indossa"}</button>
                <button style={styles.smallDangerBtn} onClick={() => rimuoviArmatura(instId)}>Rimuovi</button>
              </div>
            </div>
          ); })}
        </div>

        <div style={styles.sectionLabel}>Equipaggiamento — Accessori</div>
        <SearchAddRow query={accQuery} setQuery={setAccQuery} results={accResults} onAdd={(id) => { aggiungiAccessorio(id); setAccQuery(""); }} placeholder="Cerca un accessorio da aggiungere..." />
        <div style={styles.itemList}>
          {pg.accessoriPosseduti.map(({ instId, refId, magico, rarita }) => { const a = accessori.find((x) => x.id === refId); if (!a) return null; return (
            <div key={instId} style={styles.itemRow}>
              <button style={styles.itemName} onClick={() => openDetail({ type: "accessorio", data: a })}>{a.nome}{a.custom ? " ★" : ""}</button>
              <span style={styles.hint}>effetto descrittivo</span>
              <ComboInput value={magico} onChangeText={(t) => aggiornaCampoAccessorio(instId, { magico: t })} options={MAGICO_OPTIONS} datalistId={`dl-magico-${instId}`} placeholder="Magico?" style={styles.magicSelect} />
              <ComboInput value={rarita} onChangeText={(t) => aggiornaCampoAccessorio(instId, { rarita: t })} options={RARITA_OPTIONS} datalistId={`dl-rarita-${instId}`} placeholder="Rarità" style={styles.magicSelect} />
              <div style={styles.itemActions}><button style={styles.smallDangerBtn} onClick={() => rimuoviAccessorio(instId)}>Rimuovi</button></div>
            </div>
          ); })}
        </div>

        <div style={styles.sectionLabel}>Inventario</div>
        <div style={styles.hint}>Oggetti generici: nome, quantità e dove si trovano (es. "Zaino", "Sella del cavallo"...).</div>
        <div style={styles.invTable}>
          {pg.inventario.map((v) => (
            <div key={v.id} style={styles.invRow}>
              <AutoTextarea style={styles.invNome} placeholder="Oggetto" value={v.nome} onChange={(e) => aggiornaVoceInventario(v.id, { nome: e.target.value })} />
              <NumInput min={0} max={999} style={styles.invQty} value={v.quantita} onCommit={(n) => aggiornaVoceInventario(v.id, { quantita: n })} />
              <AutoTextarea style={styles.invPos} placeholder="Posizione" value={v.posizione} onChange={(e) => aggiornaVoceInventario(v.id, { posizione: e.target.value })} />
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

        <div style={styles.sectionLabel}>Slot Incantesimo & Punti Stregoneria <button style={styles.smallBtn} onClick={sincronizzaSlot}>🔄 Sincronizza da Classe</button></div>
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
            <div style={styles.slotCol}>
              <div style={styles.slotColTitle}>Punti Streg.</div>
              <NumInput min={0} max={20} style={styles.slotTotaliInput} value={pg.puntiStregoneria.totali} onCommit={(n) => aggiornaPuntiStregoneria({ totali: n, usati: Math.min(pg.puntiStregoneria.usati, n) })} />
              <div style={styles.slotCheckRow}>
                {pg.puntiStregoneria.totali > 0 ? Array.from({ length: pg.puntiStregoneria.totali }, (_, i) => (
                  <button key={i} style={{ ...styles.slotCheckbox, ...(i < pg.puntiStregoneria.usati ? styles.slotCheckboxUsed : {}) }} onClick={() => aggiornaPuntiStregoneria({ usati: i < pg.puntiStregoneria.usati ? i : i + 1 })} title="Segna/togli come usato" />
                )) : <span style={styles.slotEmptyHint}>—</span>}
              </div>
            </div>
          </div>
        </div>
        <div style={styles.hint}>Scrivi il totale nel box tondo e premi Invio: compariranno i quadratini da cliccare per segnare quanti ne hai usati (clicca di nuovo per togliere il segno).</div>

        <div style={styles.sectionLabel}>Incantesimi noti {classePrimaria?.caster && <span style={styles.hint}>({ABILITY_LABELS[classePrimaria.caster]}, mod. {fmt(modByAb[classePrimaria.caster])}, CD {8 + profBonus + modByAb[classePrimaria.caster]})</span>}</div>
        <SearchAddRow query={spellQuery} setQuery={setSpellQuery} results={spellResults} onAdd={(id) => { aggiungiIncantesimo(id); setSpellQuery(""); }} placeholder="Cerca un incantesimo per nome o scuola..." />
        <div style={styles.itemList}>
          {pg.incantesimiNoti.map((id) => { const s = incantesimi.find((x) => x.id === id); if (!s) return null; return (
            <div key={id} style={styles.itemRow}>
              <button style={styles.itemName} onClick={() => openDetail({ type: "incantesimo", data: s })}>{s.nome}{s.custom ? " ★" : ""}</button>
              <span style={styles.hint}>{s.livello === 0 ? "Trucchetto" : `Livello ${s.livello}`} · {s.scuola}</span>
              <div style={styles.itemActions}>
                {s.attacco && <button style={styles.smallBtn} onClick={() => attaccaConIncantesimo(s)}>🎯 TpC</button>}
                {(s.danno || s.cura) && <button style={styles.smallBtn} onClick={() => tiraDannoIncantesimo(id, s)}>{s.cura ? "💚 Cura" : `💥 Danno${critSpells[id] ? " (crit!)" : ""}`}</button>}
                <button style={styles.smallDangerBtn} onClick={() => rimuoviIncantesimo(id)}>Rimuovi</button>
              </div>
            </div>
          ); })}
        </div>

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
          {pg.infoExtra.map((v) => (
            <div key={v.id} style={styles.invRow}>
              <AutoTextarea style={styles.invNome} placeholder="Campo (es. Allineamento)" value={v.chiave} onChange={(e) => aggiornaInfoExtra(v.id, { chiave: e.target.value })} />
              <AutoTextarea style={styles.invPos} placeholder="Descrizione" value={v.valore} onChange={(e) => aggiornaInfoExtra(v.id, { valore: e.target.value })} />
              <button style={styles.pgDelBtn} onClick={() => rimuoviInfoExtra(v.id)}>✕</button>
            </div>
          ))}
        </div>
        <button style={styles.newPgBtn} onClick={aggiungiInfoExtra}>+ Aggiungi campo Info Extra</button>

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
    </div>
  );
}


export default SchedeTab;
