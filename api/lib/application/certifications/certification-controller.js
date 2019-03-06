const usecases = require('../../domain/usecases');
const certificationSerializer = require('../../infrastructure/serializers/jsonapi/certification-serializer');
const logger = require('../../infrastructure/logger');
const Boom = require('boom');
const { Deserializer } = require('jsonapi-serializer');
const JSONAPIError = require('jsonapi-serializer').Error;
const domainErrors = require('../../domain/errors');

function _deserializePayload(payload) {
  const deserializer = new Deserializer({
    keyForAttribute: 'camelCase',
  });
  return deserializer.deserialize(payload);
}

module.exports = {
  findUserCertifications(request) {
    const userId = request.auth.credentials.userId;

    return usecases.findCompletedUserCertifications({ userId })
      .then((certifications) => certificationSerializer.serialize(certifications))
      .catch((err) => {
        logger.error(err);
        throw Boom.badImplementation(err);
      });
  },

  getCertification(request, h) {
    const userId = request.auth.credentials.userId;
    const certificationId = request.params.id;

    return usecases.getUserCertificationWithResultTree({
      userId,
      certificationId,
    })
      .then((certification) => certificationSerializer.serialize(certification))
      .catch((error) => {

        if (error instanceof domainErrors.UserNotAuthorizedToAccessEntity) {
          const jsonAPIError = new JSONAPIError({
            code: '403',
            title: 'Unauthorized Access',
            detail: 'Vous n’avez pas accès à cette certification',
          });
          return h.response(jsonAPIError).code(403);
        }

        if (error instanceof domainErrors.NotFoundError) {
          const jsonApiError = new JSONAPIError({
            code: '404',
            title: 'Not Found',
            detail: error.message,
          });
          return h.response(jsonApiError).code(404);
        }

        logger.error(error);
        throw Boom.badImplementation(error);
      });
  },

  updateCertification(request) {

    return Promise.resolve(request.payload)
      .then(_deserializePayload)
      .then((payload) => {
        return usecases.updateCertification({
          certificationId: request.params.id,
          attributesToUpdate: payload,
        });
      })
      .then((certification) => certificationSerializer.serialize(certification))
      .catch((err) => {
        logger.error(err);
        throw Boom.badImplementation(err);
      });
  },
};
