module.exports = function deleteStage({ stageCollection, stageId, targetProfileId }) {
  return stageCollection.findStage(stageId, targetProfileId);
};
