import { getDivisionCertificationResultsCsv } from '../../../../src/certification/course/infrastructure/utils/csv/certification-results/get-division-certification-results-csv.js';
import { usecases } from '../domain/usecases/index.js';

const downloadCertificationResults = async function (
  request,
  h,
  dependencies = { getDivisionCertificationResultsCsv },
) {
  const organizationId = request.params.id;
  const { division } = request.query;

  const certificationResults = await usecases.getScoCertificationResultsByDivision({ organizationId, division });

  const csvResult = await dependencies.getDivisionCertificationResultsCsv({
    division,
    certificationResults,
    i18n: request.i18n,
  });

  return h
    .response(csvResult.content)
    .header('Content-Type', 'text/csv;charset=utf-8')
    .header('Content-Disposition', `attachment; filename="${csvResult.filename}"`);
};

const organizationController = {
  downloadCertificationResults,
};

export { organizationController };
