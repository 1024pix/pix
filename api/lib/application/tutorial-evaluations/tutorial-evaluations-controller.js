const usecases = require('../../domain/usecases/index.js');
const tutorialEvaluationSerializer = require('../../infrastructure/serializers/jsonapi/tutorial-evaluation-serializer');
const TutorialEvaluation = require('../../../lib/domain/models/TutorialEvaluation');

module.exports = {
  async evaluate(request, h) {
    const { userId } = request.auth.credentials;
    const { tutorialId } = request.params;
    const { status = TutorialEvaluation.statuses.LIKED } = tutorialEvaluationSerializer.deserialize(request.payload);

    const tutorialEvaluation = await usecases.addTutorialEvaluation({ userId, tutorialId, status });

    return h.response(tutorialEvaluationSerializer.serialize(tutorialEvaluation)).created();
  },
};
