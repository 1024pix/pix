module.exports = async function getOrganizationLearner({ organizationLearnerId, organizationLearnerRepository }) {
  return organizationLearnerRepository.get(organizationLearnerId);
};
