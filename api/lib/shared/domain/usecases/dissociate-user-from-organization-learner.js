import { OrganizationLearnerCannotBeDissociatedError } from '../errors.js';

const dissociateUserFromOrganizationLearner = async function ({
  organizationLearnerId,
  organizationLearnerRepository,
}) {
  const organizationLearnerForAdmin = await organizationLearnerRepository.getOrganizationLearnerForAdmin(
    organizationLearnerId
  );
  if (!organizationLearnerForAdmin.canBeDissociated) {
    throw new OrganizationLearnerCannotBeDissociatedError();
  }

  await organizationLearnerRepository.dissociateUserFromOrganizationLearner(organizationLearnerId);
};

export { dissociateUserFromOrganizationLearner };
