import { usecases } from '../domain/usecases/index.js';
import * as certificationsResultsForLivretScolaireSerializer from '../infrastructure/serializers/certification-livret-scolaire-serializer.js';

const getCertificationsByOrganizationUAI = async function (
  request,
  _h,
  dependencies = { certificationsResultsForLivretScolaireSerializer },
) {
  const uai = request.params.uai;
  const certifications = await usecases.getCertificationsResultsForLivretScolaire({ uai });
  return dependencies.certificationsResultsForLivretScolaireSerializer.serialize(certifications);
};

const livretScolaireController = {
  getCertificationsByOrganizationUAI,
};

export { livretScolaireController };
