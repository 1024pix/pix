const getOrganizationLearner = async function ({ organizationLearnerId, organizationLearnerRepository }) {
  return organizationLearnerRepository.get(organizationLearnerId);
};

export { getOrganizationLearner };
