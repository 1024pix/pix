import { TargetProfileForCreation } from '../../../src/prescription/target-profile/domain/models/TargetProfileForCreation.js';
import { TargetProfileCannotBeCreated } from '../../../src/shared/domain/errors.js';

const createTargetProfile = async function ({
  targetProfileCreationCommand,
  targetProfileAdministrationRepository,
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

  return targetProfileAdministrationRepository.create({
    targetProfileForCreation,
  });
};

export { createTargetProfile };
