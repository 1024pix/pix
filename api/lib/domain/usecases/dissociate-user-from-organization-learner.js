import { OrganizationLearnerCannotBeDissociatedError } from '../errors';

export default async function dissociateUserFromOrganizationLearner({
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
}
