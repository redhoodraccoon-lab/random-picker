import Papa from "papaparse";

export function parseTXT(text: string): string[] {
  return text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
}

export function parseCSVText(text: string): string[] {
  const result = Papa.parse<string[]>(text, { skipEmptyLines: true });
  const flat: string[] = [];
  for (const row of result.data) {
    for (const cell of row) {
      const v = String(cell ?? "").trim();
      if (v) flat.push(v);
    }
  }
  return flat;
}
