const scorecardSerializer = require('../../infrastructure/serializers/jsonapi/scorecard-serializer');
const tutorialSerializer = require('../../infrastructure/serializers/jsonapi/tutorial-serializer');
const { extractLocaleFromRequest } = require('../../infrastructure/utils/request-response-utils');
const usecases = require('../../domain/usecases/index.js');

module.exports = {
  getScorecard(request) {
    const locale = extractLocaleFromRequest(request);
    const authenticatedUserId = request.auth.credentials.userId;
    const scorecardId = request.params.id;

    return usecases.getScorecard({ authenticatedUserId, scorecardId, locale }).then(scorecardSerializer.serialize);
  },

  findTutorials(request) {
    const locale = extractLocaleFromRequest(request);
    const authenticatedUserId = request.auth.credentials.userId;
    const scorecardId = request.params.id;

    return usecases.findTutorials({ authenticatedUserId, scorecardId, locale }).then(tutorialSerializer.serialize);
  },
};
