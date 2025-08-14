import * as injectedOrganizationRepository from '../../../../shared/infrastructure/repositories/organization-repository.js';
import * as injectedTargetProfileAdministrationRepository from '../../infrastructure/repositories/target-profile-administration-repository.js';
import { TargetProfileCannotBeCreated } from '../errors.js';
import { TargetProfileForCreation } from '../models/TargetProfileForCreation.js';

const createTargetProfile = async function ({
  targetProfileCreationCommand,
  targetProfileAdministrationRepository = injectedTargetProfileAdministrationRepository,
  organizationRepository = injectedOrganizationRepository,
} = {}) {
  const targetProfileForCreation = TargetProfileForCreation.fromCreationCommand(targetProfileCreationCommand);
  try {
    await organizationRepository.get(targetProfileForCreation.ownerOrganizationId);
  } catch {
    throw new TargetProfileCannotBeCreated(
      `Cannot create target profile for non existant organization id: ${targetProfileForCreation.ownerOrganizationId}`,
    );
  }

  return targetProfileAdministrationRepository.create({
    targetProfileForCreation,
  });
};

export { createTargetProfile };
