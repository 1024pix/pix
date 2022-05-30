const { OrganizationLearnerCannotBeDissociatedError } = require('../errors');

module.exports = async function dissociateUserFromOrganizationLearner({
  schoolingRegistrationId,
  organizationLearnerRepository,
}) {
  const organizationLearnerForAdmin = await organizationLearnerRepository.getOrganizationLearnerForAdmin(
    schoolingRegistrationId
  );
  if (!organizationLearnerForAdmin.canBeDissociated) {
    throw new OrganizationLearnerCannotBeDissociatedError();
  }

  await organizationLearnerRepository.dissociateUserFromOrganizationLearner(schoolingRegistrationId);
};
