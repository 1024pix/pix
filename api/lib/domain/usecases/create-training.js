export default function createTraining({ training, domainTransaction, trainingRepository }) {
  return trainingRepository.create({ training, domainTransaction });
}
