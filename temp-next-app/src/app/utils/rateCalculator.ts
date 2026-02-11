// Calculate the displayed rate from the base rate
export function calculateDisplayRate(baseRate: string | undefined): string | undefined {
  if (!baseRate) return undefined;

  const rate = parseInt(baseRate);
  const rateMap: Record<number, number> = {
    15: 17,
    20: 22,
    25: 27,
    30: 33,
    35: 38,
    40: 44,
    45: 49,
    50: 55,
  };

  return rateMap[rate]?.toString() || baseRate;
}

