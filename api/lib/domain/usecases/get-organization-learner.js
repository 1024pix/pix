const getOrganizationLearner = async function ({ organizationLearnerId, organizationLearnerFollowUpRepository }) {
  return organizationLearnerFollowUpRepository.get(organizationLearnerId);
};

export { getOrganizationLearner };
