const scorecardSerializer = require('../../infrastructure/serializers/jsonapi/scorecard-serializer.js');
const tutorialSerializer = require('../../infrastructure/serializers/jsonapi/tutorial-serializer.js');
const { extractLocaleFromRequest } = require('../../infrastructure/utils/request-response-utils.js');
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
