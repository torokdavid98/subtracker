export const CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'HUF', symbol: 'Ft', name: 'Hungarian Forint' },
] as const;

export function getCurrencySymbol(currencyCode: string): string {
  const currency = CURRENCIES.find(c => c.code === currencyCode);
  return currency?.symbol || currencyCode;
}

export function formatCurrency(amount: number, currencyCode: string): string {
  const symbol = getCurrencySymbol(currencyCode);

  // Format with 2 decimal places
  const formattedAmount = amount.toFixed(2);

  // For currencies where symbol goes after the amount
  if (['HUF'].includes(currencyCode)) {
    return `${formattedAmount} ${symbol}`;
  }

  // Default: symbol before amount
  return `${symbol}${formattedAmount}`;
}
