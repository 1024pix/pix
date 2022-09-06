const StageForCreation = require('../models/StageForCreation');

module.exports = function createStage({ stageCommandCreation, stageRepository }) {
  const stageToCreate = StageForCreation.fromCreationCommand(stageCommandCreation);
  return stageRepository.create(stageToCreate);
};
