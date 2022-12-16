module.exports = async function findTargetProfileStages({ targetProfileId, targetProfileRepository }) {
  return targetProfileRepository.findStages({ targetProfileId });
};
