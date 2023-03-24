module.exports = function getTraining({ trainingId, trainingRepository }) {
  return trainingRepository.getWithTriggersForAdmin({ trainingId });
};
