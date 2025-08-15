import * as injectedTrainingRepository from '../../infrastructure/repositories/training-repository.js';
import * as injectedTrainingTriggerRepository from '../../infrastructure/repositories/training-trigger-repository.js';

const createOrUpdateTrainingTrigger = async function ({
  trainingId,
  tubes,
  type,
  threshold,
  trainingRepository = injectedTrainingRepository,
  trainingTriggerRepository = injectedTrainingTriggerRepository,
} = {}) {
  await trainingRepository.get({ trainingId });
  return trainingTriggerRepository.createOrUpdate({
    trainingId,
    triggerTubesForCreation: tubes,
    type,
    threshold,
  });
};

export { createOrUpdateTrainingTrigger };
