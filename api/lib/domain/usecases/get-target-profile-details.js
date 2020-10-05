module.exports = function getTargetProfileDetails({ targetProfileId, targetProfileRepository }) {
  return targetProfileRepository.get(targetProfileId);
};
