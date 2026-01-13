/**
 * exportChart
 * Minimal helper to export an element as PNG using html2canvas if present.
 * Falls back to throwing a helpful error if html2canvas is not available.
 */

export async function exportChart(element: HTMLElement, filename = 'chart.png') {
  if (!(element instanceof HTMLElement)) throw new Error('Invalid element');
  // Try to use html2canvas if available globally
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  if (typeof (window as any).html2canvas === 'function') {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const canvas = await (window as any).html2canvas(element);
    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    return;
  }

  throw new Error('html2canvas not found. Install html2canvas or provide a screenshot flow.');
}
