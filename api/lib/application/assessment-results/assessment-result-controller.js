const Boom = require('boom');

const assessmentResultService = require('../../../lib/domain/services/assessment-result-service');

const { NotFoundError } = require('../../domain/errors');
const logger = require('../../infrastructure/logger');

module.exports = {

  save(request, reply) {
    const assessmentResult = request.payload.data.attributes;

    return assessmentResultService.save(assessmentResult)
      .then(reply)
      .catch((error) => {
        if(error instanceof NotFoundError) {
          return reply(Boom.notFound(error));
        }
        logger.error(error);

        reply(Boom.badImplementation(error));
      });
  }

};
