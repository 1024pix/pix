const TargetProfileForCreation = require('../models/TargetProfileForCreation');
module.exports = async function createTargetProfile({
  targetProfileData,
  targetProfileRepository,
  targetProfileWithLearningContentRepository,
}) {
  const targetProfile = new TargetProfileForCreation(targetProfileData);
  const targetProfileId = await targetProfileRepository.create(targetProfile);
  return targetProfileWithLearningContentRepository.get({ id: targetProfileId });
};
