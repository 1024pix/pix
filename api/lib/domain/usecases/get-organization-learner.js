export default async function getOrganizationLearner({ organizationLearnerId, organizationLearnerFollowUpRepository }) {
  return organizationLearnerFollowUpRepository.get(organizationLearnerId);
}
