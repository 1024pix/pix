const TrainingSummary = require('../../../../lib/domain/read-models/TrainingSummary');

module.exports = function buildTrainingSummary({ id = 1, title = 'Training Summary 1', isRecommendable = false } = {}) {
  return new TrainingSummary({
    id,
    title,
    isRecommendable,
  });
};
