import { getCertificationsResultsForLS } from '../../domain/usecases';
import certificationsResultsForLsSerializer from '../../infrastructure/serializers/jsonapi/certifications-livret-scolaire/certification-ls-serializer';

export default {
  async getCertificationsByOrganizationUAI(request) {
    const uai = request.params.uai;
    const certifications = await getCertificationsResultsForLS({ uai });
    return certificationsResultsForLsSerializer.serialize(certifications);
  },
};
