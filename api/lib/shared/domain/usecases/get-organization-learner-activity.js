const getOrganizationLearnerActivity = async function ({
  organizationLearnerId,
  organizationLearnerActivityRepository,
}) {
  return organizationLearnerActivityRepository.get(organizationLearnerId);
};

export { getOrganizationLearnerActivity };
