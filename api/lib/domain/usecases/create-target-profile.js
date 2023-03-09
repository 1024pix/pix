const TargetProfileForCreation = require('../models/TargetProfileForCreation.js');
const learningContentConversionService = require('../services/learning-content/learning-content-conversion-service.js');
const { TargetProfileCannotBeCreated } = require('../errors');
module.exports = async function createTargetProfile({
  targetProfileCreationCommand,
  domainTransaction,
  targetProfileRepository,
  organizationRepository,
}) {
  const targetProfileForCreation = TargetProfileForCreation.fromCreationCommand(targetProfileCreationCommand);
  try {
    await organizationRepository.get(targetProfileForCreation.ownerOrganizationId);
  } catch (error) {
    throw new TargetProfileCannotBeCreated(
      `Cannot create target profile for non existant organization id: ${targetProfileForCreation.ownerOrganizationId}`
    );
  }

  const targetProfileId = await targetProfileRepository.createWithTubes({
    targetProfileForCreation,
    domainTransaction,
  });
  const skills = await learningContentConversionService.findActiveSkillsForCappedTubes(targetProfileForCreation.tubes);
  await targetProfileRepository.updateTargetProfileWithSkills({
    targetProfileId,
    skills,
    domainTransaction,
  });
  return targetProfileId;
};
