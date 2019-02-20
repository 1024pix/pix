const infraErrors = require('./../../infrastructure/errors');
const usecases = require('../../domain/usecases');
const errorManager = require('../../infrastructure/utils/error-manager');
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
      .catch((error) => errorManager.send(h, error));
  }
};
