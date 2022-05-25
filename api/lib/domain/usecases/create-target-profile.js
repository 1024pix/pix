const TargetProfileForCreation = require('../models/TargetProfileForCreation');
module.exports = async function createTargetProfile({
  targetProfileData,
  targetProfileRepository,
  targetProfileWithLearningContentRepository,
}) {
  const targetProfileForCreation = new TargetProfileForCreation(targetProfileData);
  const targetProfileId = await targetProfileRepository.create(targetProfileForCreation);
  return targetProfileWithLearningContentRepository.get({ id: targetProfileId });
};
