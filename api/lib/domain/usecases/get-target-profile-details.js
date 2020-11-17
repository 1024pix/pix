module.exports = function getTargetProfileDetails({ targetProfileId, targetProfileRepository }) {
  return targetProfileRepository.getReadModel(targetProfileId);
};
