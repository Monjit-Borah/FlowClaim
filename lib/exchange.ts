export async function getExchangeRates(baseCurrency: string) {
  const response = await fetch(`https://api.exchangerate-api.com/v4/latest/${baseCurrency}`, {
    cache: "no-store"
  });
  if (!response.ok) {
    throw new Error("Failed to fetch exchange rates");
  }
  return (await response.json()) as {
    base: string;
    rates: Record<string, number>;
    date: string;
  };
}

export async function convertCurrency(amount: number, from: string, to: string) {
  if (from === to) {
    return { amount, rate: 1 };
  }

  const payload = await getExchangeRates(from);
  const rate = payload.rates[to];
  if (!rate) {
    throw new Error(`Missing rate from ${from} to ${to}`);
  }

  return {
    amount: Number((amount * rate).toFixed(2)),
    rate
  };
}
