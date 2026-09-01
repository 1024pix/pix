/**
 * Exports a CSV bilan for a Lot and triggers browser download.
 *
 * Columns: ligne_source, nom, statut, id_organisation, lien
 * statut uses the display label (pret → "créée", others as verdict value)
 *
 * @param {import('../domain/lot.js').default} lot
 */
export function exporterBilan(lot) {
  const header = 'ligne_source,nom,statut,id_organisation,lien';

  const rows = lot.appels.map((appel) => {
    const id = appel.resultat?.id ?? '';
    const lien = id ? `${window.location.origin}/organizations/${id}` : '';
    let statut = appel.verdict ?? '';
    if (statut === 'pret' && id) {
      statut = 'créée';
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
      escape(appel.ligneSource ?? ''),
      escape(appel.nom),
      escape(statut),
      escape(id),
      escape(lien),
    ].join(',');
  });

  const csv = [header, ...rows].join('\n');

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'bilan-organisations.csv';
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
