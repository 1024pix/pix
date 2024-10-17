import { usecases } from '../domain/usecases/index.js';

async function deleteCertification(
  request,
  h,
  dependencies = { deleteCertificationIssueReport: usecases.deleteCertificationIssueReport },
) {
  const certificationIssueReportId = request.params.id;
  await dependencies.deleteCertificationIssueReport({ certificationIssueReportId });

  return h.response().code(204);
}

async function manuallyResolve(
  request,
  h,
  dependencies = { manuallyResolveCertificationIssueReport: usecases.manuallyResolveCertificationIssueReport },
) {
  const certificationIssueReportId = request.params.id;
  const resolution = request.payload.data.resolution;
  await dependencies.manuallyResolveCertificationIssueReport({
    certificationIssueReportId,
    resolution,
  });

  return h.response().code(204);
}

const certificationIssueReportController = { deleteCertification, manuallyResolve };

export { certificationIssueReportController };
