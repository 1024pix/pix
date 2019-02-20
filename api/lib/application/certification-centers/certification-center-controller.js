const usecases = require('../../domain/usecases');
const certificationCenterSerializer = require('../../infrastructure/serializers/jsonapi/certification-center-serializer');
const sessionSerializer = require('../../infrastructure/serializers/jsonapi/session-serializer');
const errorManager = require('../../infrastructure/utils/error-manager');

module.exports = {

  save(request, h) {
    const certificationCenter = certificationCenterSerializer.deserialize(request.payload);
    return usecases.saveCertificationCenter({ certificationCenter })
      .then(certificationCenterSerializer.serialize)
      .catch((error) => errorManager.send(h, error));
  },

  getById(request, h) {
    const certificationCenterId = request.params.id;
    return usecases.getCertificationCenter({ id: certificationCenterId })
      .then(certificationCenterSerializer.serialize)
      .catch((error) => errorManager.send(h, error));
  },

  find(request, h) {
    return usecases.findCertificationCenters()
      .then(certificationCenterSerializer.serialize)
      .catch((error) => errorManager.send(h, error));
  },

  getSessions(request, h) {
    const certificationCenterId = parseInt(request.params.id);
    const userId = parseInt(request.auth.credentials.userId);

    return usecases.findSessionsForCertificationCenter({ userId, certificationCenterId })
      .then((sessions) => sessionSerializer.serialize(sessions))
      .catch((error) => errorManager.send(h, error));
  }
};
