module.exports = function getTargetProfileDetails({ targetProfileId, targetProfileWithLearningContentRepository }) {
  return targetProfileWithLearningContentRepository.get({ id: targetProfileId });
};
