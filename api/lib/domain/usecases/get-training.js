module.exports = function getTraining({ trainingId, trainingRepository }) {
  return trainingRepository.get({ trainingId });
};
