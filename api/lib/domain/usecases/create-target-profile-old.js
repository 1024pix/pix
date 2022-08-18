const TargetProfileForCreationOld = require('../models/TargetProfileForCreationOld');
module.exports = async function createTargetProfile_old({
  targetProfileData,
  targetProfileRepository,
  targetProfileWithLearningContentRepository,
}) {
  const targetProfileForCreation = new TargetProfileForCreationOld(targetProfileData);
  const targetProfileId = await targetProfileRepository.create(targetProfileForCreation);
  return targetProfileWithLearningContentRepository.get({ id: targetProfileId });
};
