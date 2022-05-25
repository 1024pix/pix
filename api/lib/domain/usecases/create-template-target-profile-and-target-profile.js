const TargetProfileForCreation = require('../models/TargetProfileForCreation');

module.exports = async function createTemplateTargetProfile({
  targetProfileTemplateData,
  targetProfileData,
  targetProfileRepository,
  targetProfileWithLearningContentRepository,
}) {
  const targetProfileForCreation = new TargetProfileForCreation(targetProfileData);
  const createdTargetProfileTemplate = await targetProfileRepository.createTemplateAndTargetProfile({
    targetProfileTemplate: targetProfileTemplateData,
    targetProfileForCreation,
  });
  const targetProfileWithLearningContent = await targetProfileWithLearningContentRepository.get({
    id: createdTargetProfileTemplate.targetProfileIds[0],
  });
  return {
    ...createdTargetProfileTemplate,
    targetProfiles: [targetProfileWithLearningContent],
  };
};
