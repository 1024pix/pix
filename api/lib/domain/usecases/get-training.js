export default function getTraining({ trainingId, trainingRepository }) {
  return trainingRepository.get(trainingId);
}
