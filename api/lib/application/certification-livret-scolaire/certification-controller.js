const { getCertificationsResultsForLS } = require('../../domain/usecases/index.js');
const certificationsResultsForLsSerializer = require('../../infrastructure/serializers/jsonapi/certifications-livret-scolaire/certification-ls-serializer.js');

module.exports = {
  async getCertificationsByOrganizationUAI(request) {
    const uai = request.params.uai;
    const certifications = await getCertificationsResultsForLS({ uai });
    return certificationsResultsForLsSerializer.serialize(certifications);
  },
};
