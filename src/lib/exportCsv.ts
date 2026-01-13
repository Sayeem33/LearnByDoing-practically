export function exportCsv(data: any[], filename = 'data.csv') {
  if (!data || data.length === 0) return;
  const headers = Object.keys(data[0]);
  const csvContent = [headers.join(','), ...data.map((row) => headers.map((h) => row[h]).join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
