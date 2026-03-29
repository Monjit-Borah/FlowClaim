import { prisma } from "@/lib/db";
import { getCountriesWithCurrencies, getCurrencyByCountryLive } from "@/lib/countries";

export async function getCompany(companyId: string) {
  return prisma.company.findUnique({ where: { id: companyId } });
}

export async function updateCompany(companyId: string, data: {
  name?: string;
  country?: string;
  industry?: string;
  size?: string;
  approvalPreference?: string;
}) {
  const baseCurrency = data.country ? await getCurrencyByCountryLive(data.country) : undefined;
  return prisma.company.update({
    where: { id: companyId },
    data: {
      ...data,
      ...(baseCurrency ? { baseCurrency } : {})
    }
  });
}

export async function getCurrencyConfig(country: string) {
  return {
    country,
    currency: await getCurrencyByCountryLive(country),
    exchangeStrategy: "Live exchangerate-api snapshot"
  };
}

export async function listCountries() {
  return getCountriesWithCurrencies();
}
