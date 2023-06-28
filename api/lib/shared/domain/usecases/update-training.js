const updateTraining = async function ({ training, trainingRepository }) {
  const trainingId = training.id;
  await trainingRepository.get({ trainingId });

  return trainingRepository.update({
    id: trainingId,
    attributesToUpdate: training,
  });
};

export { updateTraining };
