import { TargetProfileCannotBeCreated } from '../../../src/shared/domain/errors.js';
import { TargetProfileForCreation } from '../../../src/shared/domain/models/TargetProfileForCreation.js';

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
