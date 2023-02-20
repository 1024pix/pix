import Training from '../../../../lib/domain/read-models/TrainingSummary';

export default function buildTrainingSummary({ id = 1, title = 'Training Summary 1' } = {}) {
  return new Training({
    id,
    title,
  });
}
