import * as injectedTutorialEvaluationRepository from '../../infrastructure/repositories/tutorial-evaluation-repository.js';
import * as injectedTutorialRepository from '../../infrastructure/repositories/tutorial-repository.js';

const addTutorialEvaluation = async function ({
  tutorialRepository = injectedTutorialRepository,
  tutorialEvaluationRepository = injectedTutorialEvaluationRepository,
  userId,
  tutorialId,
  status,
} = {}) {
  await tutorialRepository.get({ tutorialId });

  return tutorialEvaluationRepository.createOrUpdate({ userId, tutorialId, status });
};

export { addTutorialEvaluation };
