import { featureToggles } from '../../../shared/infrastructure/feature-toggles/index.js';
import { getI18nFromRequest } from '../../../shared/infrastructure/i18n/i18n.js';
import { usecases } from '../domain/usecases/index.js';
import { serialize } from '../infrastructure/serializers/csv/session-certification-results.ts';
import { getDivisionCertificationResultsCsv } from '../infrastructure/utils/csv/certification-results/get-division-certification-results-csv.js';

async function downloadCertificationResults(request, h, dependencies = { getDivisionCertificationResultsCsv }) {
  const i18n = getI18nFromRequest(request);

  const organizationId = request.params.organizationId;
  const { division } = request.query;

  const readNewCertificationResults = await featureToggles.get('readNewCertificationResults');
  if (!readNewCertificationResults) {
    const certificationResults = await usecases.getScoCertificationResultsByDivision({ organizationId, division });

    const csvResult = await dependencies.getDivisionCertificationResultsCsv({
      division,
      certificationResults,
      i18n,
    });

    return h
      .response(csvResult.content)
      .header('Content-Type', 'text/csv;charset=utf-8')
      .header('Content-Disposition', `attachment; filename="${csvResult.filename}"`);
  }

  const certificationResults = await usecases.getCertificationResultsForDivision({
    organizationId,
    division,
  });

  const csv = serialize(certificationResults, i18n, { showCertificationCenter: false });
  const filename = i18n.__('certification-results-csv.filenames.DIVISION_CERTIFICATION_RESULTS_FILENAME', {
    dateWithTime: new Date().toISOString().slice(0, 10).replace(/-/g, ''),
    division,
  });
  return h
    .response(csv)
    .header('Content-Type', 'text/csv;charset=utf-8')
    .header('Content-Disposition', `attachment; filename=${filename}`);
}

export const organizationController = {
  downloadCertificationResults,
};
