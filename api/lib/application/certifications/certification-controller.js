const usecases = require('../../domain/usecases');
const certificationSerializer = require('../../infrastructure/serializers/jsonapi/certification-serializer');
const certificationRepository = require('../../infrastructure/repositories/certification-repository');
const assessmentRepository = require('../../infrastructure/repositories/assessment-repository');
const competenceMarksRepository = require('../../infrastructure/repositories/competence-mark-repository');
const competenceRepository = require('../../infrastructure/repositories/competence-repository');
const logger = require('../../infrastructure/logger');
const Boom = require('boom');
const { Deserializer } = require('jsonapi-serializer');
const JSONAPIError = require('jsonapi-serializer').Error;
const infraErrors = require('../../infrastructure/errors');
const domainErrors = require('../../domain/errors');
const errorSerializer = require('../../infrastructure/serializers/jsonapi/error-serializer');

function _deserializePayload(payload) {
  const deserializer = new Deserializer({
    keyForAttribute: 'camelCase',
  });
  return deserializer.deserialize(payload);
}

module.exports = {
  findUserCertifications(request, reply) {
    const userId = request.auth.credentials.userId;

    return usecases.findCompletedUserCertifications({ userId, certificationRepository })
      .then(certifications => {
        return reply(certificationSerializer.serialize(certifications)).code(200);
      })
      .catch(err => {
        logger.error(err);
        reply(Boom.badImplementation(err));
      });
  },

  getCertification(request, reply) {
    const userId = request.auth.credentials.userId;
    const certificationId = request.params.id;
    let certification;
    return usecases.getUserCertification({ userId, certificationId, certificationRepository })
      .then(userCertifiation => {
        certification = userCertifiation;
        return usecases.getUserCertifiedProfile({ userId, certificationId, assessmentRepository, competenceMarksRepository, competenceRepository });
      })
      .then(certifiedProfile => {
        certification.certifiedProfile = certifiedProfile;
        return reply(certificationSerializer.serialize(certification)).code(200);
      })
      .catch((error) => {

        if (error instanceof domainErrors.UserNotAuthorizedToAccessEntity) {
          const jsonAPIError = new JSONAPIError({
            code: '403',
            title: 'Unauthorized Access',
            detail: 'Vous n’avez pas accès à cette certification',
          });
          return reply(jsonAPIError).code(403);
        }

        if (error instanceof domainErrors.NotFoundError) {
          const jsonApiError = new JSONAPIError({
            code: '404',
            title: 'Not Found',
            detail: error.message,
          });
          return reply(jsonApiError).code(404);
        }

        logger.error(error);
        const infraError = new infraErrors.InfrastructureError(error.message);
        return reply(errorSerializer.serialize(infraError)).code(infraError.code);
      });
  },

  updateCertification(request, reply) {

    return Promise.resolve(request.payload)
      .then(_deserializePayload)
      .then((payload) => {
        return usecases.updateCertification({
          certificationId: request.params.id,
          attributesToUpdate: payload,
          certificationRepository,
        });
      })
      .then(certification => {
        return reply(certificationSerializer.serialize(certification)).code(200);
      })
      .catch(err => {
        logger.error(err);
        reply(Boom.badImplementation(err));
      });
  },
};
