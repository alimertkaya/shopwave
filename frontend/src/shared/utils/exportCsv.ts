export const exportToCsv = (filename: string, rows: Record<string, unknown>[]) => {
  if (!rows.length) return;
  const headers = Object.keys(rows[0]).join(',');
  const body = rows.map((r) => Object.values(r).join(',')).join('\n');
  const blob = new Blob([`${headers}\n${body}`], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.csv`;
  link.click();
  URL.revokeObjectURL(url);
};
