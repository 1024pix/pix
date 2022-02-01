const stageValidator = require('../validators/stage-validator');

module.exports = function createStage({ stage, stageRepository }) {
  stageValidator.validate({ stage });

  return stageRepository.create(stage);
};
