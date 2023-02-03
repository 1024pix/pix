const buildTube = require('./build-tube');
const TrainingTrigger = require('../../../../lib/domain/models/TrainingTrigger');

module.exports = function buildTrainingTrigger({
  id = 1000,
  trainingId = 156,
  tubesWithLevel = [{ ...buildTube(), level: 2 }],
  type = TrainingTrigger.types.PREREQUISITE,
  threshold = 60,
} = {}) {
  return new TrainingTrigger({
    id,
    trainingId,
    tubes: tubesWithLevel,
    type,
    threshold,
  });
};
