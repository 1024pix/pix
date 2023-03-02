module.exports = function getTraining({ trainingId, trainingRepository }) {
  return trainingRepository.getWithTriggers({ trainingId });
};
