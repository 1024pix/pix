const createTraining = function ({ training, domainTransaction, trainingRepository }) {
  return trainingRepository.create({ training, domainTransaction });
};

export { createTraining };
