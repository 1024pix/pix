import { TutorialEvaluation } from '../../domain/models/TutorialEvaluation.js';
import { usecases } from '../../domain/usecases/index.js';
import * as tutorialEvaluationSerializer from '../../infrastructure/serializers/jsonapi/tutorial-evaluation-serializer.js';

const evaluate = async function (request, h, dependencies = { tutorialEvaluationSerializer }) {
  const { userId } = request.auth.credentials;
  const { tutorialId } = request.params;
  const { status = TutorialEvaluation.statuses.LIKED } = dependencies.tutorialEvaluationSerializer.deserialize(
    request.payload,
  );

  const tutorialEvaluation = await usecases.addTutorialEvaluation({ userId, tutorialId, status });

  return h.response(tutorialEvaluationSerializer.serialize(tutorialEvaluation)).created();
};

const tutorialEvaluationsController = { evaluate };
export { tutorialEvaluationsController };
