import { OrganizationLearnerCannotBeDissociatedError } from '../../../../../src/shared/domain/errors.js';
import * as injectedOrganizationLearnerRepository from '../../infrastructure/repositories/organization-learner-repository.js';

const dissociateUserFromOrganizationLearner = async function ({
  organizationLearnerId,
  organizationLearnerRepository = injectedOrganizationLearnerRepository,
  organizationFeatureRepository,
} = {}) {
  const organizationLearnerForAdmin =
    await organizationLearnerRepository.getOrganizationLearnerForAdmin(organizationLearnerId);

  if (
    !organizationLearnerForAdmin.canBeDissociated &&
    !(await organizationFeatureRepository.hasLearnersImportFeature({
      organizationId: organizationLearnerForAdmin.organizationId,
    }))
  ) {
    throw new OrganizationLearnerCannotBeDissociatedError();
  }

  await organizationLearnerRepository.dissociateUserFromOrganizationLearner(organizationLearnerId);
};

export { dissociateUserFromOrganizationLearner };
