module.exports = function updateStage({ stage, stageCollection }) {
  stageCollection.updateStage(stage);
  return stageCollection;
};
