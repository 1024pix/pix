import usecases from '../../domain/usecases';
import tutorialEvaluationSerializer from '../../infrastructure/serializers/jsonapi/tutorial-evaluation-serializer';
import TutorialEvaluation from '../../../lib/domain/models/TutorialEvaluation';

export default {
  async evaluate(request, h) {
    const { userId } = request.auth.credentials;
    const { tutorialId } = request.params;
    const { status = TutorialEvaluation.statuses.LIKED } = tutorialEvaluationSerializer.deserialize(request.payload);

    const tutorialEvaluation = await usecases.addTutorialEvaluation({ userId, tutorialId, status });

    return h.response(tutorialEvaluationSerializer.serialize(tutorialEvaluation)).created();
  },
};
