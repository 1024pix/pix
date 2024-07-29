const createTraining = function ({ training, trainingRepository }) {
  return trainingRepository.create({ training });
};

export { createTraining };
