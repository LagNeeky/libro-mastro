// Elenco base delle abilita (skill), raggruppate per caratteristica

const DEFAULT_SKILLS = [
  { name: "Atletica", ab: "FOR" },
  { name: "Acrobazia", ab: "DES" }, { name: "Furtività", ab: "DES" }, { name: "Rapidità di Mano", ab: "DES" },
  { name: "Arcano", ab: "INT" }, { name: "Investigare", ab: "INT" }, { name: "Natura", ab: "INT" }, { name: "Religione", ab: "INT" }, { name: "Storia", ab: "INT" },
  { name: "Addestrare Animali", ab: "SAG" }, { name: "Intuizione", ab: "SAG" }, { name: "Medicina", ab: "SAG" }, { name: "Percezione", ab: "SAG" }, { name: "Sopravvivenza", ab: "SAG" },
  { name: "Inganno", ab: "CAR" }, { name: "Intimidire", ab: "CAR" }, { name: "Intrattenere", ab: "CAR" }, { name: "Persuasione", ab: "CAR" },
].map((s) => ({ ...s, custom: false }));


export { DEFAULT_SKILLS };
