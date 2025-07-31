const updateOrganizationLearnerName = async function ({
  organizationLearnerId,
  firstName,
  lastName,
  organizationLearnerRepository,
}) {
  await organizationLearnerRepository.updateName({
    organizationLearnerId,
    firstName,
    lastName,
  });
};

export { updateOrganizationLearnerName };
