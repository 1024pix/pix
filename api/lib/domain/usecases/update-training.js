module.exports = async function updateTraining({ training, trainingRepository }) {
  const trainingId = training.id;
  await trainingRepository.get({ trainingId });

  return trainingRepository.update({
    id: trainingId,
    attributesToUpdate: training,
  });
};
