import * as injectedTrainingRepository from '../../infrastructure/repositories/training-repository.js';

const updateTraining = async function ({ training, trainingRepository = injectedTrainingRepository } = {}) {
  const trainingId = training.id;
  await trainingRepository.get({ trainingId });

  return trainingRepository.update({
    id: trainingId,
    attributesToUpdate: training,
  });
};

export { updateTraining };
