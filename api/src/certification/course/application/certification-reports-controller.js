import { usecases } from '../../shared/domain/usecases/index.js';
import * as certificationReportSerializer from '../../shared/infrastructure/serializers/jsonapi/certification-report-serializer.js';

const getCertificationReports = async function (request, h, dependencies = { certificationReportSerializer }) {
  const sessionId = request.params.id;

  const certificationReports = await usecases.getSessionCertificationReports({ sessionId });
  return dependencies.certificationReportSerializer.serialize(certificationReports);
};

const certificationReportsController = {
  getCertificationReports,
};
export { certificationReportsController };
