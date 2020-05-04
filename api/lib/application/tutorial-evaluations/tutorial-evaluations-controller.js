const usecases = require('../../domain/usecases');
const tutorialEvaluationSerializer = require('../../infrastructure/serializers/jsonapi/tutorial-evaluation-serializer');

module.exports = {

  async evaluate(request, h) {
    const { userId } = request.auth.credentials;
    const { tutorialId } = request.params;

    const tutorialEvaluation = await usecases.addTutorialEvaluation({ userId, tutorialId });

    return h.response(tutorialEvaluationSerializer.serialize(tutorialEvaluation)).created();
  },

};
