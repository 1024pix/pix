/**
 * Exports a CSV report for a Batch and triggers browser download.
 *
 * Columns: source_row, name, status, organisation_id, link
 */
export function exportReport(batch) {
  const header = 'source_row,name,status,organisation_id,link';

  const rows = batch.calls.map((call) => {
    const id = call.result?.id ?? '';
    const link = id ? `${window.location.origin}/organizations/${id}` : '';
    let status = call.verdict ?? '';
    if (status === 'ready' && id) {
      status = 'created';
    }
    // Escape CSV fields that may contain commas or quotes
    const escape = (v) => {
      const s = String(v ?? '');
      if (s.includes(',') || s.includes('"') || s.includes('\n')) {
        return `"${s.replace(/"/g, '""')}"`;
      }
      return s;
    };
    return [
      escape(call.sourceRow ?? ''),
      escape(call.name),
      escape(status),
      escape(id),
      escape(link),
    ].join(',');
  });

  const csv = [header, ...rows].join('\n');

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'batch-report.csv';
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
