export const formatPrice = (value: number): string =>
  new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(value);
