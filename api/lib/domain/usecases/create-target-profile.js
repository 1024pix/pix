const TargetProfileForCreation = require('../models/TargetProfileForCreation.js');
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

  return targetProfileRepository.create({
    targetProfileForCreation,
    domainTransaction,
  });
};
