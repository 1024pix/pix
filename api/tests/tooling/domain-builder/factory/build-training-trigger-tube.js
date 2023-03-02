const buildTube = require('./build-tube');
const TrainingTriggerTube = require('../../../../lib/domain/models/TrainingTriggerTube');

module.exports = function buildTrainingTriggerTube({ id = 1000, tube = buildTube(), level = 8 } = {}) {
  return new TrainingTriggerTube({
    id,
    tube,
    level,
  });
};
