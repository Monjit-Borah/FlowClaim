const countryCurrencyMap: Record<string, string> = {
  "United States": "USD",
  India: "INR",
  "United Kingdom": "GBP",
  Germany: "EUR",
  France: "EUR",
  Singapore: "SGD",
  "United Arab Emirates": "AED"
};

const exchangeRates: Record<string, number> = {
  USD: 1,
  GBP: 1.28,
  EUR: 1.08,
  INR: 0.012,
  AED: 0.27,
  SGD: 0.74
};

export function getCurrencyByCountry(country: string) {
  return countryCurrencyMap[country] ?? "USD";
}

export function convertToBase(amount: number, currency: string, baseCurrency = "USD") {
  const sourceRate = exchangeRates[currency] ?? 1;
  const baseRate = exchangeRates[baseCurrency] ?? 1;
  return Math.round((amount * sourceRate) / baseRate);
}

export function getExchangeSnapshot() {
  return exchangeRates;
}
