// Utilita per il lancio dei dadi

function rollD20() { return 1 + Math.floor(Math.random() * 20); }
function parseDiceNotation(notation) {
  if (!notation) return { groups: [], flat: 0 };
  const parts = String(notation).split("+").map((s) => s.trim());
  const groups = []; let flat = 0;
  parts.forEach((p) => { const m = p.match(/^(\d*)d(\d+)$/i); if (m) groups.push({ count: Number(m[1] || 1), die: Number(m[2]) }); else { const n = Number(p); if (!isNaN(n)) flat += n; } });
  return { groups, flat };
}
function rollDiceNotation(notation, doubleDice) {
  const { groups, flat } = parseDiceNotation(notation);
  const rolls = [];
  groups.forEach((g) => { const count = doubleDice ? g.count * 2 : g.count; for (let i = 0; i < count; i++) rolls.push(1 + Math.floor(Math.random() * g.die)); });
  return { rolls, flat, total: rolls.reduce((a, b) => a + b, 0) + flat };
}


export { rollD20, parseDiceNotation, rollDiceNotation };
