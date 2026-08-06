import { certificationReportSerializer } from '../../shared/infrastructure/serializers/jsonapi/certification-report-serializer.js';
import { usecases } from '../domain/usecases/index.js';

async function getCertificationReports(request, h, dependencies = { certificationReportSerializer }) {
  const sessionId = request.params.sessionId;

  const certificationReports = await usecases.getSessionCertificationReports({ sessionId });
  return dependencies.certificationReportSerializer.serialize(certificationReports);
}

export const certificationReportsController = {
  getCertificationReports,
};
