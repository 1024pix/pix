const TargetProfileForCreation = require('../models/TargetProfileForCreation');

module.exports = async function createTemplateTargetProfile({
  targetProfileTemplate,
  targetProfileData,
  targetProfileRepository,
  targetProfileWithLearningContentRepository,
}) {
  const targetProfileForCreation = new TargetProfileForCreation(targetProfileData);
  const createdTargetProfileTemplate = await targetProfileRepository.createTemplateAndTargetProfile({
    targetProfileTemplate,
    targetProfileForCreation,
  });
  const targetProfileWithLearningContent = await targetProfileWithLearningContentRepository.get({
    id: createdTargetProfileTemplate.targetProfiles[0].id,
  });
  return {
    ...createdTargetProfileTemplate,
    targetProfiles: [targetProfileWithLearningContent],
  };
};
