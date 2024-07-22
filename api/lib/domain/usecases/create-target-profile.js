import { TargetProfileCannotBeCreated } from '../errors.js';
import { TargetProfileForCreation } from '../models/TargetProfileForCreation.js';

const createTargetProfile = async function ({
  targetProfileCreationCommand,
  targetProfileRepository,
  organizationRepository,
}) {
  const targetProfileForCreation = TargetProfileForCreation.fromCreationCommand(targetProfileCreationCommand);
  try {
    await organizationRepository.get(targetProfileForCreation.ownerOrganizationId);
  } catch (error) {
    throw new TargetProfileCannotBeCreated(
      `Cannot create target profile for non existant organization id: ${targetProfileForCreation.ownerOrganizationId}`,
    );
  }

  return targetProfileRepository.create({
    targetProfileForCreation,
  });
};

export { createTargetProfile };
