export function pickWinners<T>(participants: T[], count: number): T[] {
  if (count > participants.length) {
    throw new Error("Winner count cannot exceed participant count");
  }
  const arr = [...participants];
  for (let i = arr.length - 1; i > 0; i--) {
    const buf = new Uint32Array(1);
    crypto.getRandomValues(buf);
    const j = buf[0] % (i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.slice(0, count);
}

export function shuffleArray<T>(arr: T[]): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const buf = new Uint32Array(1);
    crypto.getRandomValues(buf);
    const j = buf[0] % (i + 1);
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function pickWeightedWinners(pool: string[], count: number): string[] {
  const shuffled = shuffleArray(pool);
  const seen = new Set<string>();
  const winners: string[] = [];
  for (const name of shuffled) {
    if (!seen.has(name)) {
      seen.add(name);
      winners.push(name);
      if (winners.length === count) break;
    }
  }
  return winners;
}
