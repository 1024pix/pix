import { TrainingSummary } from '../../../../lib/shared/domain/read-models/TrainingSummary.js';

const buildTrainingSummary = function ({ id = 1, title = 'Training Summary 1', isRecommendable = false } = {}) {
  return new TrainingSummary({
    id,
    title,
    isRecommendable,
  });
};

export { buildTrainingSummary };
