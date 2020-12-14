const usecases = require('../../domain/usecases');
const certificationsResultsForLsSerializer = require('../../infrastructure/serializers/jsonapi/certifications-livret-scolaire/certification-ls-serializer');

module.exports = {

  getCertificationsByOrganizationUAI(request) {
    const uai = request.params.uai;
    return usecases.getCertificationsResultsForLS({ uai })
      .then((certifications) => certificationsResultsForLsSerializer.serialize(certifications));
  },

};
