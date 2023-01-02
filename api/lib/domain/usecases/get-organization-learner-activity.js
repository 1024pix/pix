module.exports = async function getOrganizationLearnerActivity({
  organizationLearnerId,
  organizationLearnerActivityRepository,
}) {
  return organizationLearnerActivityRepository.get(organizationLearnerId);
};
