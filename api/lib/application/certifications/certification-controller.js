const usecases = require('../../domain/usecases');
const certificationSerializer = require('../../infrastructure/serializers/jsonapi/certification-serializer');
const certificationRepository = require('../../infrastructure/repositories/certification-repository');
const logger = require('../../infrastructure/logger');
const Boom = require('boom');
const { Deserializer } = require('jsonapi-serializer');

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

  updateCertification(request, reply) {

    // TODO: What does a Deserializer do ? Does it returns a Domain object ? Then do we need a generic deserializer ?
    return new Deserializer({ keyForAttribute: 'camelCase' })
      .deserialize(request.payload)
      .then((payload) => {
        return usecases.updateCertification({
          certificationId: request.params.id,
          attributesToUpdate: payload,
          certificationRepository
        });
      })
      .then(certification => {
        return reply(certificationSerializer.serialize(certification)).code(200);
      })
      .catch(err => {
        logger.error(err);
        reply(Boom.badImplementation(err));
      });
  }
};
