const usecases = require('../../domain/usecases');
const certificationCenterSerializer = require('../../infrastructure/serializers/jsonapi/certification-center-serializer');
const controllerReplies = require('../../infrastructure/controller-replies');
const {
  NotFoundError: InfrastructureNotFoundError,
} = require('../../infrastructure/errors');

const {
  NotFoundError,
} = require('../../domain/errors');

module.exports = {

  save(request, h) {
    const certificationCenter = certificationCenterSerializer.deserialize(request.payload);
    return usecases.saveCertificationCenter({ certificationCenter })
      .then((certificationCenter) => certificationCenterSerializer.serialize(certificationCenter))
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
      .catch((error) => {
        return controllerReplies(h).error(error);
      });
  },
};
