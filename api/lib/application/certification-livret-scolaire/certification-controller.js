import { usecases } from '../../domain/usecases/index.js';
import * as certificationsResultsForLsSerializer from '../../infrastructure/serializers/jsonapi/certifications-livret-scolaire/certification-ls-serializer.js';

const getCertificationsByOrganizationUAI = async function (request) {
  const uai = request.params.uai;
  const certifications = await usecases.getCertificationsResultsForLS({ uai });
  return certificationsResultsForLsSerializer.serialize(certifications);
};

export { getCertificationsByOrganizationUAI };
