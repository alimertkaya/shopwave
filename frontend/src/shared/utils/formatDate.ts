export const formatDate = (value: string | Date): string =>
  new Intl.DateTimeFormat('tr-TR', { dateStyle: 'medium', timeStyle: 'short' }).format(
    new Date(value)
  );
