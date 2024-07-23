const createOrUpdateTrainingTrigger = async function ({
  trainingId,
  tubes,
  type,
  threshold,
  trainingRepository,
  trainingTriggerRepository,
}) {
  await trainingRepository.get({ trainingId });
  return trainingTriggerRepository.createOrUpdate({
    trainingId,
    triggerTubesForCreation: tubes,
    type,
    threshold,
  });
};

export { createOrUpdateTrainingTrigger };
