import * as injectedTrainingRepository from '../../infrastructure/repositories/training-repository.js';

const createTraining = function ({ training, trainingRepository = injectedTrainingRepository } = {}) {
  return trainingRepository.create({ training });
};

export { createTraining };
