type CountryCurrencyResult = {
  name: string;
  currencyCode: string;
};

export async function getCountriesWithCurrencies(): Promise<CountryCurrencyResult[]> {
  const response = await fetch(
    "https://restcountries.com/v3.1/all?fields=name,currencies",
    { next: { revalidate: 60 * 60 * 24 } }
  );
  if (!response.ok) {
    throw new Error("Failed to fetch countries");
  }

  const data = (await response.json()) as Array<{
    name?: { common?: string };
    currencies?: Record<string, unknown>;
  }>;

  return data
    .map((item) => ({
      name: item.name?.common ?? "",
      currencyCode: Object.keys(item.currencies ?? {})[0] ?? "USD"
    }))
    .filter((item) => item.name)
    .sort((a, b) => a.name.localeCompare(b.name));
}

export async function getCurrencyByCountryLive(country: string) {
  const countries = await getCountriesWithCurrencies();
  return countries.find((entry) => entry.name === country)?.currencyCode ?? "USD";
}
