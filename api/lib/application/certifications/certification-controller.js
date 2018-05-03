const usecases = require('../../domain/usecases');
const certificationSerializer = require('../../infrastructure/serializers/jsonapi/certification-serializer');
const certificationRepository = require('../../infrastructure/repositories/certification-repository');
const logger = require('../../infrastructure/logger');
const Boom = require('boom');

module.exports = {
  findUserCertifications(request, reply) {
    const userId = request.auth.credentials.userId;
    return usecases.findCompletedUserCertifications({ userId, certificationRepository })
      .then(certifications => {
        return reply(certificationSerializer.serializeCertification(certifications)).code(200);
      })
      .catch(err => {
        logger.error(err);
        reply(Boom.badImplementation(err));
      });
  },

  updateCertification(request, reply) {
    return usecases.updateCertification({
      certificationId: request.params.id,
      attributesToUpdate: request.payload.data.attributes,
      certificationRepository
    })
      .then(() => reply().code(204))
      .catch(err => {
        logger.error(err);
        reply(Boom.badImplementation(err));
      });
  }
};
