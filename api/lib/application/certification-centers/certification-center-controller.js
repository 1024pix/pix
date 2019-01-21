const usecases = require('../../domain/usecases');
const certificationCenterSerializer = require('../../infrastructure/serializers/jsonapi/certification-center-serializer');
const controllerReplies = require('../../infrastructure/controller-replies');

const {
  NotFoundError,
} = require('../../domain/errors');

const {
  NotFoundError: InfrastructureNotFoundError,
} = require('../../infrastructure/errors');

module.exports = {

  save(request, h) {
    const certificationCenter = certificationCenterSerializer.deserialize(request.payload);
    return usecases.saveCertificationCenter({ certificationCenter })
      .then(certificationCenterSerializer.serialize)
      .catch((error) => {
        return controllerReplies(h).error(error);
      });
  },

  getById(request, h) {
    const certificationCenterId = request.params.id;
    return usecases.getCertificationCenter({ id: certificationCenterId })
      .then(certificationCenterSerializer.serialize)
      .then(controllerReplies(h).ok)
      .catch((error) => {
        if (error instanceof NotFoundError) {
          const err = new InfrastructureNotFoundError(error.message);
          return controllerReplies(h).error(err);
        }
        return controllerReplies(h).error(error);
      });
  },

  find(request, h) {
    return usecases.findCertificationCenters()
      .then(certificationCenterSerializer.serialize)
      .then(controllerReplies(h).ok)
      .catch(controllerReplies(h).error);
  },

  getSessions(request, h) {
    const certificationCenterId = request.params.id;
    const userId = request.auth.credentials.userId;

    return usecases.findSessions({ certificationCenterId })
      .then((sessions) => campaignSerializer.serialize(sessions))
      .then(controllerReplies(h).ok)
      .catch(controllerReplies(h).error);
  }
};
