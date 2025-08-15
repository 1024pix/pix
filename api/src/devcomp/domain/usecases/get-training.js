import * as injectedTrainingRepository from '../../infrastructure/repositories/training-repository.js';

const getTraining = function ({ trainingId, trainingRepository = injectedTrainingRepository } = {}) {
  return trainingRepository.getWithTriggersForAdmin({ trainingId });
};

export { getTraining };
