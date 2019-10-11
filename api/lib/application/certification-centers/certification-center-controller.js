const usecases = require('../../domain/usecases');
const certificationCenterSerializer = require('../../infrastructure/serializers/jsonapi/certification-center-serializer');
const sessionSerializer = require('../../infrastructure/serializers/jsonapi/session-serializer');

module.exports = {

  save(request) {
    const certificationCenter = certificationCenterSerializer.deserialize(request.payload);
    return usecases.saveCertificationCenter({ certificationCenter })
      .then(certificationCenterSerializer.serialize);
  },

  getById(request) {
    const certificationCenterId = parseInt(request.params.id);
    return usecases.getCertificationCenter({ id: certificationCenterId })
      .then(certificationCenterSerializer.serialize);
  },

  find() {
    return usecases.findCertificationCenters()
      .then(certificationCenterSerializer.serialize);
  },

  getSessions(request) {
    const certificationCenterId = parseInt(request.params.id);
    const userId = parseInt(request.auth.credentials.userId);

    return usecases.findSessionsForCertificationCenter({ userId, certificationCenterId })
      .then((sessions) => sessionSerializer.serialize(sessions));
  }
};
