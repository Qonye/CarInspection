export interface CurrencyOption {
  code: string;
  symbol: string;
  name: string;
}

export const commonCurrencies: CurrencyOption[] = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'KES', symbol: 'KES', name: 'Kenya Shilling' },
  // Add more common currencies as needed
];

export const formatCurrency = (amount: number, currency: CurrencyOption): string => {
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: currency.code,
  }).format(amount);
};

export const detectUserCurrency = async (): Promise<CurrencyOption> => {
  try {
    const response = await fetch('https://ipapi.co/json/');
    const data = await response.json();
    const userCurrency = commonCurrencies.find(c => c.code === data.currency);
    return userCurrency || commonCurrencies[0]; // Default to USD if not found
  } catch (error) {
    console.error('Failed to detect currency:', error);
    return commonCurrencies[0]; // Default to USD on error
  }
};
