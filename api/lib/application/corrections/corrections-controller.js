const Boom = require('boom');
const JSONAPIError = require('jsonapi-serializer').Error;

const logger = require('../../infrastructure/logger');
const infraErrors = require('./../../infrastructure/errors');
const domainErrors = require('./../../domain/errors');
const errorSerializer = require('./../../infrastructure/serializers/jsonapi/error-serializer');
const usecases = require('../../domain/usecases');

const correctionSerializer = require('../../infrastructure/serializers/jsonapi/correction-serializer');

function _validateQueryParams(query) {
  return new Promise((resolve) => {
    if (typeof query.answerId === 'undefined') {
      throw new infraErrors.MissingQueryParamError('answerId');
    }
    resolve();
  });
}

module.exports = {

  findByAnswerId(request, h) {
    return _validateQueryParams(request.query)
      .then(() => {
        return usecases.getCorrectionForAnswerWhenAssessmentEnded({
          answerId: request.query.answerId
        });
      })
      .then((correction) => Array.of(correction))
      .then(correctionSerializer.serialize)
      .catch((error) => {
        // TODO: factoriser la gestion des erreurs
        if (error instanceof infraErrors.InfrastructureError) {
          return h.response(errorSerializer.serialize(error)).code(error.code);
        }
        if (error instanceof domainErrors.NotFoundError) {
          const jsonApiError = new JSONAPIError({
            code: '404',
            title: 'Not Found',
            detail: error.message
          });
          return h.response(jsonApiError).code(404);
        }
        if (error instanceof domainErrors.NotCompletedAssessmentError) {
          const jsonApiError = new JSONAPIError({
            code: '409',
            title: 'Assessment Not Completed',
            detail: error.message
          });
          return h.response(jsonApiError).code(409);
        }

        logger.error(error);
        throw Boom.badImplementation(error);
      });
  }
};
