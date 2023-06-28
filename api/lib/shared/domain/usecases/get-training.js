const getTraining = function ({ trainingId, trainingRepository }) {
  return trainingRepository.getWithTriggersForAdmin({ trainingId });
};

export { getTraining };
