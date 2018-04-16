const Boom = require('boom');
const logger = require('../../infrastructure/logger');
const infraErrors = require('./../../infrastructure/errors');
const errorSerializer = require('./../../infrastructure/serializers/jsonapi/error-serializer');

function _validateQueryParams(query) {
  return new Promise((resolve, reject) => {
    if (typeof query.assessmentId === 'undefined')
      reject(new infraErrors.MissingQueryParamError('assessmentId'));
    if (typeof query.answerId === 'undefined')
      reject(new infraErrors.MissingQueryParamError('answerId'));
    resolve();
  });
}

module.exports = {
  find(request, reply) {
    return _validateQueryParams(request.query)
      .then(() => {
        reply().code(200);
      })
      .catch((error) => {
        if (error instanceof infraErrors.InfrastructureError) {
          return reply(errorSerializer.serialize(error)).code(error.code);
        }

        logger.error(error);
        return reply(Boom.badImplementation(error));
      });
  }
};
