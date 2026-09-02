import React, { useState, useRef, useEffect } from 'react';
import { styles, palette } from '../styles.js';
import { ABILITIES, ABILITY_LABELS, PROGRESSIONE_LABELS, fmt } from '../utils/helpers.js';

// Piccoli componenti riutilizzati in piu tab dell'app


function ComboInput({ value, onChangeText, options, placeholder, datalistId, style }) {
  return (
    <>
      <input list={datalistId} value={value} onChange={(e) => onChangeText(e.target.value)} placeholder={placeholder} style={style || styles.miniInput} />
      <datalist id={datalistId}>{options.map((o) => <option key={o.id} value={o.nome} />)}</datalist>
    </>
  );
}

function FormModal({ title, onClose, onSubmit, submitLabel, canSubmit = true, children }) {
  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modalBox} onClick={(e) => e.stopPropagation()}>
        <button style={styles.modalClose} onClick={onClose}>✕</button>
        <h3 style={styles.modalTitle}>{title}</h3>
        <div style={{ marginTop: 12 }}>{children}</div>
        <button style={{ ...styles.primaryBtn, marginTop: 10, ...(canSubmit ? {} : styles.primaryBtnDisabled) }} onClick={() => canSubmit && onSubmit()} disabled={!canSubmit}>{submitLabel || "+ Aggiungi"}</button>
        {!canSubmit && <div style={{ ...styles.hint, marginTop: 6 }}>Compila almeno il campo Nome per poter salvare.</div>}
      </div>
    </div>
  );
}

function StatBox({ label, value, sub, children }) {
  return (
    <div style={styles.statBox}>
      <div style={styles.statBoxLabel}>{label}</div>
      <div style={styles.statBoxValue}>{value}</div>
      {sub && <div style={styles.statBoxSub}>{sub}</div>}
      {children && <div style={styles.statBoxExtra}>{children}</div>}
    </div>
  );
}

function SearchAddRow({ query, setQuery, results, onAdd, placeholder }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <input style={styles.searchInput} value={query} onChange={(e) => setQuery(e.target.value)} placeholder={placeholder} />
      {results.length > 0 && <div style={styles.searchResults}>{results.map((r) => <button key={r.id} style={styles.searchResultRow} onClick={() => onAdd(r.id)}><span>{r.nome}{r.custom ? " ★" : ""}</span><span style={styles.hint}>+ aggiungi</span></button>)}</div>}
    </div>
  );
}

function AutoTextarea({ value, onChange, placeholder, style }) {
  const ref = useRef(null);
  useEffect(() => {
    if (ref.current) { ref.current.style.height = "auto"; ref.current.style.height = `${ref.current.scrollHeight}px`; }
  }, [value]);
  return (
    <textarea
      ref={ref}
      rows={1}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      style={{ ...style, resize: "none", overflow: "hidden", whiteSpace: "pre-wrap", wordBreak: "break-word", fontFamily: "inherit", lineHeight: 1.4 }}
    />
  );
}

function NumInput({ value, onCommit, min, max, style, placeholder }) {
  const [text, setText] = useState(String(value ?? ""));
  const ref = useRef(null);
  const textRef = useRef(text);
  const minRef = useRef(min);
  const maxRef = useRef(max);
  useEffect(() => { setText(String(value ?? "")); }, [value]);
  useEffect(() => { textRef.current = text; }, [text]);
  useEffect(() => { minRef.current = min; maxRef.current = max; }, [min, max]);

  const clamp = (n) => {
    if (minRef.current !== undefined) n = Math.max(minRef.current, n);
    if (maxRef.current !== undefined) n = Math.min(maxRef.current, n);
    return n;
  };
  const commit = () => {
    let n = parseInt(textRef.current, 10);
    if (isNaN(n)) n = 0;
    n = clamp(n);
    setText(String(n));
    onCommit(n);
  };

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const handleWheel = (e) => {
      if (document.activeElement !== el) return;
      e.preventDefault();
      let current = parseInt(textRef.current, 10);
      if (isNaN(current)) current = 0;
      const next = clamp(current + (e.deltaY < 0 ? 1 : -1));
      setText(String(next));
      onCommit(next);
    };
    el.addEventListener("wheel", handleWheel, { passive: false });
    return () => el.removeEventListener("wheel", handleWheel);
  }, [onCommit]);

  return (
    <input
      ref={ref}
      type="number"
      style={style}
      value={text}
      placeholder={placeholder}
      onChange={(e) => setText(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => { if (e.key === "Enter") e.currentTarget.blur(); }}
    />
  );
}



function DetailModal({ detail, onClose, classi }) {
  if (!detail) return null;
  const { type, data } = detail;
  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modalBox} onClick={(e) => e.stopPropagation()}>
        <button style={styles.modalClose} onClick={onClose}>✕</button>
        <h3 style={styles.modalTitle}>{data.nome}{data.custom ? " ★ (homebrew)" : ""}</h3>

        {type === "incantesimo" && (
          <div>
            <div style={styles.hint}>{data.livello === 0 ? "Trucchetto" : `Incantesimo di livello ${data.livello}`} · {data.scuola}</div>
            <div style={styles.detailGrid}>
              <DetailField label="Tempo di lancio" value={data.tempo} /><DetailField label="Gittata" value={data.gittata} />
              <DetailField label="Componenti" value={data.componenti} /><DetailField label="Durata" value={data.durata} />
              {data.conc && <DetailField label="Concentrazione" value="Sì" />}
              {data.danno && <DetailField label="Danno" value={`${data.danno} ${data.tipoDanno || ""}`} />}
              {data.cura && <DetailField label="Cura" value={`${data.cura} + mod. caratteristica`} />}
              {data.tiroSalvezza && <DetailField label="Tiro salvezza" value={ABILITY_LABELS[data.tiroSalvezza]} />}
              {data.attacco && <DetailField label="Tipo" value="Tiro per colpire" />}
              <DetailField label="Classi" value={(data.classi || []).join(", ") || "—"} />
            </div>
            <p style={styles.modalDesc}>{data.desc}</p>
          </div>
        )}
        {type === "arma" && <div><div style={styles.hint}>Arma da {data.categoria} · Rarità: {data.rarita || "Comune"}</div><div style={styles.detailGrid}><DetailField label="Danno" value={`${data.danno} ${data.tipoDanno}`} /><DetailField label="Proprietà" value={[data.finesse ? "Finesse" : null, data.note].filter(Boolean).join(", ") || "—"} /><DetailField label="Classi" value={data.classi && data.classi.length ? data.classi.map((cid) => (classi.find((c) => c.id === cid) || {}).nome).filter(Boolean).join(", ") : "Tutte"} /></div></div>}
        {type === "armatura" && <div><div style={styles.hint}>Rarità: {data.rarita || "Comune"}</div><div style={styles.detailGrid}><DetailField label="Tipo" value={data.tipo} /><DetailField label="CA base" value={data.ca} /><DetailField label="Bonus DES" value={data.maxDex === null ? "Illimitato" : `Massimo +${data.maxDex}`} />{data.forzaMin && <DetailField label="Forza richiesta" value={data.forzaMin} />}<DetailField label="Classi" value={data.classi && data.classi.length ? data.classi.map((cid) => (classi.find((c) => c.id === cid) || {}).nome).filter(Boolean).join(", ") : "Tutte"} /></div></div>}
        {type === "accessorio" && <div><div style={styles.hint}>Rarità: {data.rarita || "Comune"} · Utilizzabile da tutte le classi</div><p style={styles.modalDesc}>{data.desc}</p></div>}
        {type === "trasfondo" && (
          <div>
            <div style={styles.detailGrid}>
              <DetailField label="Competenze" value={data.abilita.join(", ") || "—"} />
              <DetailField label="Strumenti" value={data.strumenti.join(", ") || "—"} />
              <DetailField label="Lingue" value={data.lingue} />
            </div>
            <p style={styles.modalDesc}><strong style={{ color: palette.gold }}>Equipaggiamento.</strong> {data.equipaggiamento}</p>
            {data.privilegio?.nome && <p style={styles.modalDesc}><strong style={{ color: palette.gold }}>{data.privilegio.nome}.</strong> {data.privilegio.desc}</p>}
          </div>
        )}
        {type === "talento" && (
          <div>
            {data.prerequisito && <div style={styles.hint}>Richiede: {data.prerequisito}</div>}
            <p style={styles.modalDesc}>{data.desc}</p>
          </div>
        )}
        {(type === "razza" || type === "sottorazza") && (
          <div>
            {data.velocita && <div style={styles.hint}>Velocità: {data.velocita}</div>}
            <div style={styles.detailGrid}>{ABILITIES.filter((a) => data.bonus[a]).map((a) => <DetailField key={a} label={ABILITY_LABELS[a]} value={fmt(data.bonus[a])} />)}</div>
            {data.tratti.map((t, i) => <p key={i} style={styles.modalDesc}><strong style={{ color: palette.gold }}>{t.nome}.</strong> {t.desc}</p>)}
          </div>
        )}
        {(type === "classe" || type === "sottoclasse") && (
          <div>
            {data.dado && <div style={styles.hint}>Dado vita d{data.dado} · {data.caster ? `${PROGRESSIONE_LABELS[data.progressione || "pieno"]} (${ABILITY_LABELS[data.caster]})` : PROGRESSIONE_LABELS.nessuno}</div>}
            {data.tratti.map((t, i) => <p key={i} style={styles.modalDesc}><strong style={{ color: palette.gold }}>{t.nome}.</strong> {t.desc}</p>)}
          </div>
        )}
        {type === "regola" && (
          <div>
            <div style={styles.hint}>{data.categoria}</div>
            {data.testo && <p style={{ ...styles.modalDesc, whiteSpace: "pre-line" }}>{data.testo}</p>}
            {data.tabelle && data.tabelle.map((t, i) => <RuleTable key={i} header={t.header} rows={t.rows} />)}
          </div>
        )}
      </div>
    </div>
  );
}
function DetailField({ label, value }) { return <div style={styles.detailField}><div style={styles.detailFieldLabel}>{label}</div><div style={styles.detailFieldValue}>{value}</div></div>; }



function dieStyle(value) {
  if (value === 20) return { background: palette.gold, color: "#241d16", borderColor: palette.gold };
  if (value === 1) return { background: "#1f1b17", color: "#8a8171", borderColor: "#4a3f30" };
  return { background: palette.panel, color: palette.parchment, borderColor: palette.line };
}
function RollModal({ roll, onClose, onChangeMode, onRoll }) {
  if (!roll) return null;
  if (roll.kind === "d20") {
    const rolled = roll.dice.length > 0; const usedVal = rolled ? roll.dice[roll.usedIndex] : null; const total = rolled ? usedVal + roll.modifier : null;
    return (
      <div style={styles.overlay} onClick={onClose}>
        <div style={styles.modalBox} onClick={(e) => e.stopPropagation()}>
          <button style={styles.modalClose} onClick={onClose}>✕</button>
          <h3 style={styles.modalTitle}>{roll.title}</h3>
          <div style={styles.hint}>{roll.modifierLabel}</div>
          <div style={styles.modeRow}>{["normale", "vantaggio", "svantaggio"].map((m) => <button key={m} onClick={() => onChangeMode(m)} style={{ ...styles.modeBtn, ...(roll.mode === m ? styles.modeBtnActive(m) : {}) }}>{m === "normale" ? "Normale" : m === "vantaggio" ? "Vantaggio" : "Svantaggio"}</button>)}</div>
          <div style={styles.diceRow}>{rolled ? roll.dice.map((v, i) => <div key={i} style={{ ...styles.die, ...dieStyle(v), ...(roll.mode !== "normale" && i === roll.usedIndex ? { boxShadow: `0 0 0 3px ${roll.mode === "vantaggio" ? palette.successGreen : palette.dangerRed}` } : {}) }}>{v}</div>) : <div style={styles.hint}>Premi "Tira i dadi" per lanciare.</div>}</div>
          {rolled && <div style={styles.resultBox}>{usedVal === 20 && <div style={styles.critText}>COLPO CRITICO — 20 naturale!</div>}{usedVal === 1 && <div style={styles.failText}>FALLIMENTO CRITICO — 1 naturale</div>}<div style={styles.totalText}>Totale: {total} <span style={styles.hint}>({usedVal} {fmt(roll.modifier)})</span></div></div>}
          <button style={styles.primaryBtn} onClick={onRoll}>{rolled ? "Tira di nuovo" : "🎲 Tira i dadi"}</button>
        </div>
      </div>
    );
  }
  const r = roll.result;
  const rc = roll.risultatiComponenti;
  const totaleComponenti = rc ? rc.reduce((s, c) => s + c.total, 0) + roll.flatBonus : null;
  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modalBox} onClick={(e) => e.stopPropagation()}>
        <button style={styles.modalClose} onClick={onClose}>✕</button>
        <h3 style={styles.modalTitle}>{roll.title}</h3>
        {roll.doubled && <div style={styles.critText}>Critico: dadi raddoppiati!</div>}
        {rc ? (
          <>
            <div style={styles.hint}>{roll.componenti.map((c) => `${c.notazione} ${c.tipo}`).join(" + ")}{roll.flatBonusLabel ? ` — ${roll.flatBonusLabel}` : ""}</div>
            {rc.length ? rc.map((c, i) => (
              <div key={i} style={styles.componenteDannoBlocco}>
                <div style={styles.componenteDannoTipo}>{c.tipo}</div>
                <div style={styles.diceRow}>{c.rolls.map((v, j) => <div key={j} style={{ ...styles.die, background: palette.panel, color: palette.parchment, borderColor: palette.line }}>{v}</div>)}</div>
                <div style={styles.hint}>Subtotale {c.tipo}: {c.total} <span style={styles.hint}>({c.rolls.join(" + ")}{c.flat ? ` ${fmt(c.flat)}` : ""})</span></div>
              </div>
            )) : <div style={styles.hint}>Premi "Tira i dadi" per lanciare.</div>}
            {rc.length > 0 && <div style={styles.resultBox}><div style={styles.totalText}>Totale complessivo: {totaleComponenti}</div></div>}
          </>
        ) : (
          <>
            <div style={styles.hint}>{roll.notation}{roll.flatBonusLabel ? ` — ${roll.flatBonusLabel}` : ""}</div>
            <div style={styles.diceRow}>{r ? r.rolls.map((v, i) => <div key={i} style={{ ...styles.die, background: palette.panel, color: palette.parchment, borderColor: palette.line }}>{v}</div>) : <div style={styles.hint}>Premi "Tira i dadi" per lanciare.</div>}</div>
            {r && <div style={styles.resultBox}><div style={styles.totalText}>Totale: {r.total + roll.flatBonus} <span style={styles.hint}>({r.rolls.join(" + ")}{roll.flatBonus ? ` ${fmt(roll.flatBonus)}` : ""})</span></div></div>}
          </>
        )}
        <button style={styles.primaryBtn} onClick={onRoll}>{(r || (rc && rc.length)) ? "Tira di nuovo" : "🎲 Tira i dadi"}</button>
      </div>
    </div>
  );
}


function RuleTable({ header, rows }) {
  return (
    <div style={styles.ruleTableWrap}>
      <table style={styles.ruleTable}>
        <thead><tr>{header.map((h, i) => <th key={i} style={styles.ruleTh}>{h}</th>)}</tr></thead>
        <tbody>{rows.map((r, i) => <tr key={i}>{r.map((c, j) => <td key={j} style={styles.ruleTd}>{c}</td>)}</tr>)}</tbody>
      </table>
    </div>
  );
}


export { ComboInput, FormModal, StatBox, SearchAddRow, NumInput, AutoTextarea, DetailModal, DetailField, RollModal, RuleTable };
