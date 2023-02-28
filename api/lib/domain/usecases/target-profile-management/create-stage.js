module.exports = function createStage({ stage, stageCollection }) {
  stageCollection.addStage(stage);
  return stageCollection;
};
