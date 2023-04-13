const scorecardSerializer = require('../../infrastructure/serializers/jsonapi/scorecard-serializer.js');
const tutorialSerializer = require('../../infrastructure/serializers/jsonapi/tutorial-serializer.js');
const requestResponseUtils = require('../../infrastructure/utils/request-response-utils.js');
const usecases = require('../../domain/usecases/index.js');

module.exports = {
  getScorecard(request, h, dependencies = { requestResponseUtils, scorecardSerializer }) {
    const locale = dependencies.requestResponseUtils.extractLocaleFromRequest(request);
    const authenticatedUserId = request.auth.credentials.userId;
    const scorecardId = request.params.id;

    return usecases
      .getScorecard({
        authenticatedUserId,
        scorecardId,
        locale,
      })
      .then(dependencies.scorecardSerializer.serialize);
  },

  findTutorials(request, h, dependencies = { requestResponseUtils, tutorialSerializer }) {
    const locale = dependencies.requestResponseUtils.extractLocaleFromRequest(request);
    const authenticatedUserId = request.auth.credentials.userId;
    const scorecardId = request.params.id;

    return usecases
      .findTutorials({
        authenticatedUserId,
        scorecardId,
        locale,
      })
      .then(dependencies.tutorialSerializer.serialize);
  },
};
