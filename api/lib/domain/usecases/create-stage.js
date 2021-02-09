
module.exports = function createStage({ stage, stageRepository }) {
  return stageRepository.create(stage);
};
