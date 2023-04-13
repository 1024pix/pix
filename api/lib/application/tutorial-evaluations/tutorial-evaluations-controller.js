const usecases = require('../../domain/usecases/index.js');
const tutorialEvaluationSerializer = require('../../infrastructure/serializers/jsonapi/tutorial-evaluation-serializer.js');
const TutorialEvaluation = require('../../../lib/domain/models/TutorialEvaluation.js');

module.exports = {
  async evaluate(request, h, dependencies = { tutorialEvaluationSerializer }) {
    const { userId } = request.auth.credentials;
    const { tutorialId } = request.params;
    const { status = TutorialEvaluation.statuses.LIKED } = dependencies.tutorialEvaluationSerializer.deserialize(
      request.payload
    );

    const tutorialEvaluation = await usecases.addTutorialEvaluation({ userId, tutorialId, status });

    return h.response(tutorialEvaluationSerializer.serialize(tutorialEvaluation)).created();
  },
};
