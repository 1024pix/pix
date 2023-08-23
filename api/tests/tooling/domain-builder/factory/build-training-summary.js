import { TrainingSummary } from '../../../../lib/domain/read-models/TrainingSummary.js';

const buildTrainingSummary = function ({
  id = 1,
  title = 'Training Summary 1',
  prerequisiteThreshold,
  goalThreshold,
} = {}) {
  return new TrainingSummary({
    id,
    title,
    prerequisiteThreshold,
    goalThreshold,
  });
};

export { buildTrainingSummary };
