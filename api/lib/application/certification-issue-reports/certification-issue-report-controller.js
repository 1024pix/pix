import { usecases } from '../../domain/usecases/index.js';

const deleteCertificationIssueReport = async function (request) {
  const certificationIssueReportId = request.params.id;
  await usecases.deleteCertificationIssueReport({ certificationIssueReportId });

  return null;
};

const manuallyResolve = async function (request, h) {
  const certificationIssueReportId = request.params.id;
  const resolution = request.payload.data.resolution;
  await usecases.manuallyResolveCertificationIssueReport({
    certificationIssueReportId,
    resolution,
  });

  return h.response().code(204);
};

export { deleteCertificationIssueReport, manuallyResolve };
