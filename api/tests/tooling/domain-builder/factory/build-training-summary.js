const Training = require('../../../../lib/domain/read-models/TrainingSummary');

module.exports = function buildTrainingSummary({ id = 1, title = 'Training Summary 1' } = {}) {
  return new Training({
    id,
    title,
  });
};
