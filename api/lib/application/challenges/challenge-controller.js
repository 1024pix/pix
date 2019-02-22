const { NotFoundError: DomainNotFoundError } = require('../../domain/errors');
const controllerReplies = require('../../infrastructure/controller-replies');
const { NotFoundError: InfrastructureNotFoundError } = require('../../infrastructure/errors');
const logger = require('../../infrastructure/logger');
const challengeRepository = require('../../infrastructure/repositories/challenge-repository');
const challengeSerializer = require('../../infrastructure/serializers/jsonapi/challenge-serializer');

module.exports = {

  async get(request, h) {
    try {
      const challengeId = request.params.id;

      const challenge = await challengeRepository.get(challengeId);

      return challengeSerializer.serialize(challenge);
    } catch (err) {

      if (err instanceof DomainNotFoundError) {
        const error = new InfrastructureNotFoundError(err.message);
        return controllerReplies(h).error(error);
      }

      logger.error(err);
      return controllerReplies(h).error(err);
    }
  },

};
