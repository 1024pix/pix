const scorecardSerializer = require('../../infrastructure/serializers/jsonapi/scorecard-serializer');
const tutorialSerializer = require('../../infrastructure/serializers/jsonapi/tutorial-serializer');
const usecases = require('../../domain/usecases');

module.exports = {

  getScorecard(request) {
    const authenticatedUserId = request.auth.credentials.userId;
    const scorecardId = request.params.id;

    return usecases.getScorecard({ authenticatedUserId, scorecardId })
      .then(scorecardSerializer.serialize);
  },

  getTutorials(request) {
    const authenticatedUserId = request.auth.credentials.userId.toString();
    const scorecardId = request.params.id;

    return usecases.getTutorials({ authenticatedUserId, scorecardId })
      .then(tutorialSerializer.serialize);
  },
};
