export const parseMoneyToCents = (value: string): number => {
  const normalized = value.replace(/[^0-9,.-]/g, '').replace(',', '.');
  if (!normalized) return 0;
  const [whole, fraction = ''] = normalized.split('.');
  const fractionNormalized = fraction.padEnd(2, '0').slice(0, 2);
  const cents = Number(`${whole}${fractionNormalized}`);
  return Number.isNaN(cents) ? 0 : cents;
};

export const formatCents = (cents: number): string => {
  const sign = cents < 0 ? '-' : '';
  const abs = Math.abs(cents);
  const whole = Math.floor(abs / 100);
  const fraction = String(abs % 100).padStart(2, '0');
  return `${sign}R$ ${whole.toLocaleString('pt-BR')},${fraction}`;
};

export const parseQuantityToThousandths = (value: string | number): number => {
  const normalized = String(value).replace(',', '.').replace(/[^0-9.]/g, '');
  if (!normalized) return 0;
  const [whole, fraction = ''] = normalized.split('.');
  const fractionNormalized = fraction.padEnd(3, '0').slice(0, 3);
  const wholeNumber = Number(whole || '0');
  const fractionNumber = Number(fractionNormalized || '0');
  return wholeNumber * 1000 + fractionNumber;
};

export const calculateTotalCents = (
  unitPriceCents: number,
  quantityThousandths: number
): number => {
  return Math.round((unitPriceCents * quantityThousandths) / 1000);
};
