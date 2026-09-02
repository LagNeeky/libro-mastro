import React, { useState } from "react";
import { styles, globalCss } from "./styles.js";
import { rollD20, rollDiceNotation } from "./utils/dice.js";
import { usePersistentState, useCatalogState } from "./utils/usePersistentState.js";
import { newCharacter, migratePersonaggi } from "./data/character.js";
import { DEFAULT_SKILLS } from "./data/skills.js";
import { DEFAULT_RAZZE, DEFAULT_SOTTORAZZE } from "./data/razze.js";
import { DEFAULT_CLASSI, DEFAULT_SOTTOCLASSI } from "./data/classi.js";
import { DEFAULT_WEAPONS, DEFAULT_ARMORS, DEFAULT_ACCESSORI } from "./data/equip.js";
import { DEFAULT_SPELLS } from "./data/incantesimi.js";
import { DEFAULT_BACKGROUNDS } from "./data/backgrounds.js";
import { DEFAULT_TALENTI_CATALOGO } from "./data/talenti.js";
import { DEFAULT_COMPETENZE_GENERICHE } from "./data/competenze.js";

import { RollModal, DetailModal } from "./components/shared.jsx";
import SchedeTab from "./components/SchedeTab.jsx";
import IdentitaTab from "./components/IdentitaTab.jsx";
import RegoleTab from "./components/RegoleTab.jsx";
import RazzeTab from "./components/RazzeTab.jsx";
import ClassiTab from "./components/ClassiTab.jsx";
import TrasfondiTab from "./components/TrasfondiTab.jsx";
import TalentiCatalogoTab from "./components/TalentiCatalogoTab.jsx";
import IncantesimiTab from "./components/IncantesimiTab.jsx";
import EquipTab from "./components/EquipTab.jsx";
import AppuntiTab from "./components/AppuntiTab.jsx";
import ConoscenzaTab from "./components/ConoscenzaTab.jsx";
import MappeTab from "./components/MappeTab.jsx";
import InfoModal from "./components/InfoModal.jsx";

const TABS = [
  { id: "schede", label: "Schede PG" }, { id: "identita", label: "Carta d'Identità" }, { id: "regole", label: "Regole" },
  { id: "razze", label: "Razze" }, { id: "classi", label: "Classi" }, { id: "trasfondi", label: "Background" }, { id: "talenti_catalogo", label: "Talenti" },
  { id: "incantesimi", label: "Incantesimi" }, { id: "equip", label: "Armi, Armature & Accessori" },
  { id: "appunti", label: "Appunti" }, { id: "conoscenza", label: "Conoscenza" }, { id: "mappe", label: "Mappe" },
];

export default function LibroMastro() {
  const [tab, setTab] = useState("schede");
  const [tabOrder, setTabOrder, tabOrderLoaded] = usePersistentState("tabOrder", TABS.map((t) => t.id));
  const [draggedTabId, setDraggedTabId] = useState(null);
  const [showInfo, setShowInfo] = useState(false);

  const [skills, setSkills, skillsLoaded] = useCatalogState("skills", DEFAULT_SKILLS);
  const [razze, setRazze, razzeLoaded] = useCatalogState("razze", DEFAULT_RAZZE);
  const [sottorazze, setSottorazze, sottorazzeLoaded] = useCatalogState("sottorazze", DEFAULT_SOTTORAZZE);
  const [classi, setClassi, classiLoaded] = useCatalogState("classi", DEFAULT_CLASSI);
  const [sottoclassi, setSottoclassi, sottoclassiLoaded] = useCatalogState("sottoclassi", DEFAULT_SOTTOCLASSI);
  const [armi, setArmi, armiLoaded] = useCatalogState("armi", DEFAULT_WEAPONS);
  const [armature, setArmature, armatureLoaded] = useCatalogState("armature", DEFAULT_ARMORS);
  const [accessori, setAccessori, accessoriLoaded] = useCatalogState("accessori", DEFAULT_ACCESSORI);
  const [incantesimi, setIncantesimi, incantesimiLoaded] = useCatalogState("incantesimi", DEFAULT_SPELLS);
  const [backgrounds, setBackgrounds, backgroundsLoaded] = useCatalogState("backgrounds", DEFAULT_BACKGROUNDS);
  const [talentiCatalogo, setTalentiCatalogo, talentiCatalogoLoaded] = useCatalogState("talentiCatalogo", DEFAULT_TALENTI_CATALOGO);
  const [competenzeGenericheCatalogo, setCompetenzeGenericheCatalogo, competenzeGenericheLoaded] = useCatalogState("competenzeGenericheCatalogo", DEFAULT_COMPETENZE_GENERICHE);

  const [personaggi, setPersonaggi, personaggiLoaded] = usePersistentState("personaggi", [newCharacter()], migratePersonaggi);
  const [attivoId, setAttivoId] = useState(null);
  const [roll, setRoll] = useState(null);
  const [detail, setDetail] = useState(null);
  const [appunti, setAppunti, appuntiLoaded] = usePersistentState("appunti", []);
  const [documenti, setDocumenti, documentiLoaded] = usePersistentState("documenti", []);
  const [mappe, setMappe, mappeLoaded] = usePersistentState("mappe", []);

  const tuttoCaricato = tabOrderLoaded && skillsLoaded && razzeLoaded && sottorazzeLoaded && classiLoaded &&
    sottoclassiLoaded && armiLoaded && armatureLoaded && accessoriLoaded && incantesimiLoaded &&
    backgroundsLoaded && talentiCatalogoLoaded && competenzeGenericheLoaded &&
    personaggiLoaded && appuntiLoaded && documentiLoaded && mappeLoaded;

  const orderedTabs = tabOrder.map((id) => TABS.find((t) => t.id === id)).filter(Boolean);
  const spostaTab = (targetId) => {
    if (!draggedTabId || draggedTabId === targetId) { setDraggedTabId(null); return; }
    setTabOrder((order) => {
      const nuovo = order.filter((id) => id !== draggedTabId);
      const idx = nuovo.indexOf(targetId);
      nuovo.splice(idx, 0, draggedTabId);
      return nuovo;
    });
    setDraggedTabId(null);
  };

  const pgAttivoId = attivoId && personaggi.some((p) => p.id === attivoId) ? attivoId : personaggi[0]?.id;
  const pg = personaggi.find((p) => p.id === pgAttivoId) || personaggi[0];
  const updatePg = (patch) => setPersonaggi((ps) => ps.map((p) => (p.id === pg.id ? { ...p, ...patch } : p)));
  const aggiungiPg = () => { const c = newCharacter(); setPersonaggi((ps) => [...ps, c]); setAttivoId(c.id); };
  const rimuoviPg = (id) => setPersonaggi((ps) => { const rest = ps.filter((p) => p.id !== id); if (rest.length === 0) { const c = newCharacter(); setAttivoId(c.id); return [c]; } if (id === pgAttivoId) setAttivoId(rest[0].id); return rest; });

  const esportaPg = (personaggio) => {
    const blob = new Blob([JSON.stringify(personaggio, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${(personaggio.nome || "personaggio").replace(/[^a-z0-9]+/gi, "_")}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };
  const importaPg = (file) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const dati = JSON.parse(String(reader.result));
        const nuovo = { ...newCharacter(), ...dati, id: crypto.randomUUID ? crypto.randomUUID() : `id_${Date.now()}` };
        setPersonaggi((ps) => [...ps, nuovo]);
        setAttivoId(nuovo.id);
      } catch (err) {
        alert("Il file scelto non è una scheda valida di Libro Mastro.");
      }
    };
    reader.readAsText(file);
  };

  const openD20Roll = ({ title, modifier, modifierLabel }) => setRoll({ kind: "d20", title, modifier, modifierLabel, mode: "normale", dice: [], usedIndex: null });
  const openDiceRoll = ({ title, notation, flatBonus, flatBonusLabel, doubled, componenti }) => setRoll({ kind: "dice", title, notation, flatBonus: flatBonus || 0, flatBonusLabel, doubled: !!doubled, componenti: componenti || null, result: null });
  const changeRollMode = (mode) => setRoll((r) => ({ ...r, mode, dice: [], usedIndex: null }));
  const performRoll = () => setRoll((r) => {
    if (!r) return r;
    if (r.kind === "d20") {
      const n = r.mode === "normale" ? 1 : 2;
      const dice = Array.from({ length: n }, rollD20);
      let usedIndex = 0;
      if (r.mode === "vantaggio") usedIndex = dice[0] >= dice[1] ? 0 : 1;
      if (r.mode === "svantaggio") usedIndex = dice[0] <= dice[1] ? 0 : 1;
      return { ...r, dice, usedIndex };
    }
    if (r.componenti && r.componenti.length) {
      const risultatiComponenti = r.componenti.map((c) => ({ tipo: c.tipo, notazione: c.notazione, ...rollDiceNotation(c.notazione, r.doubled) }));
      return { ...r, risultatiComponenti };
    }
    return { ...r, result: rollDiceNotation(r.notation, r.doubled) };
  });

  if (!tuttoCaricato) {
    return (
      <div style={styles.app}>
        <style>{globalCss}</style>
        <div style={{ padding: 40, textAlign: "center", color: "#c9bd9d" }}>Caricamento dei dati salvati…</div>
      </div>
    );
  }

  return (
    <div style={styles.app}>
      <style>{globalCss}</style>
      <header style={styles.header}>
        <div style={styles.headerInner}>
          <span style={styles.brandGlyph}>📖</span>
          <h1 style={styles.brandTitle}>Libro Mastro</h1>
          <button style={{ ...styles.smallBtn, marginLeft: "auto" }} onClick={() => setShowInfo(true)}>ℹ️ Come funziona</button>
        </div>
        <nav style={styles.tabs}>
          {orderedTabs.map((t) => (
            <button
              key={t.id}
              draggable
              onDragStart={() => setDraggedTabId(t.id)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => spostaTab(t.id)}
              onDragEnd={() => setDraggedTabId(null)}
              onClick={() => setTab(t.id)}
              style={{ ...styles.tabBtn, ...(tab === t.id ? styles.tabBtnActive : {}), ...(draggedTabId === t.id ? styles.tabBtnDragging : {}) }}
              title="Trascina per riordinare"
            >
              {t.label}
            </button>
          ))}
        </nav>
      </header>
      <main style={styles.main}>
        {tab === "schede" && <SchedeTab personaggi={personaggi} attivoId={pg.id} setAttivoId={setAttivoId} aggiungiPg={aggiungiPg} rimuoviPg={rimuoviPg} pg={pg} updatePg={updatePg}
          skills={skills} setSkills={setSkills} razze={razze} sottorazze={sottorazze} classi={classi} sottoclassi={sottoclassi}
          armi={armi} armature={armature} accessori={accessori} incantesimi={incantesimi}
          competenzeGenericheCatalogo={competenzeGenericheCatalogo} setCompetenzeGenericheCatalogo={setCompetenzeGenericheCatalogo}
          openD20Roll={openD20Roll} openDiceRoll={openDiceRoll} openDetail={setDetail}
          onEsportaPg={esportaPg} onImportaPg={importaPg} />}
        {tab === "identita" && <IdentitaTab personaggi={personaggi} attivoId={pg.id} setAttivoId={setAttivoId} aggiungiPg={aggiungiPg} rimuoviPg={rimuoviPg} pg={pg} updatePg={updatePg} backgrounds={backgrounds} />}
        {tab === "regole" && <RegoleTab openDetail={setDetail} />}
        {tab === "razze" && <RazzeTab razze={razze} setRazze={setRazze} sottorazze={sottorazze} setSottorazze={setSottorazze} openDetail={setDetail} />}
        {tab === "classi" && <ClassiTab classi={classi} setClassi={setClassi} sottoclassi={sottoclassi} setSottoclassi={setSottoclassi} openDetail={setDetail} />}
        {tab === "trasfondi" && <TrasfondiTab backgrounds={backgrounds} setBackgrounds={setBackgrounds} openDetail={setDetail} />}
        {tab === "talenti_catalogo" && <TalentiCatalogoTab talentiCatalogo={talentiCatalogo} setTalentiCatalogo={setTalentiCatalogo} openDetail={setDetail} pg={pg} updatePg={updatePg} />}
        {tab === "incantesimi" && <IncantesimiTab classi={classi} incantesimi={incantesimi} setIncantesimi={setIncantesimi} openDetail={setDetail} pg={pg} updatePg={updatePg} />}
        {tab === "equip" && <EquipTab classi={classi} armi={armi} setArmi={setArmi} armature={armature} setArmature={setArmature} accessori={accessori} setAccessori={setAccessori} openDetail={setDetail} pg={pg} updatePg={updatePg} />}
        {tab === "appunti" && <AppuntiTab appunti={appunti} setAppunti={setAppunti} />}
        {tab === "conoscenza" && <ConoscenzaTab documenti={documenti} setDocumenti={setDocumenti} />}
        {tab === "mappe" && <MappeTab mappe={mappe} setMappe={setMappe} />}
      </main>
      <RollModal roll={roll} onClose={() => setRoll(null)} onChangeMode={changeRollMode} onRoll={performRoll} />
      <DetailModal detail={detail} onClose={() => setDetail(null)} classi={classi} />
      {showInfo && <InfoModal onClose={() => setShowInfo(false)} />}
    </div>
  );
}
