import { services } from '../services/index.js';

export const deleteLearnersFromVariousOrganizations = async function ({
  organizationLearnerIds,
  userId,
  userRole,
  client,
  organizationLearnerRepository,
}) {
  if (organizationLearnerIds.length === 0) return;

  const learnersToDeleteByOrganization = await organizationLearnerRepository.getLearnersGroupedByOrganizations({
    organizationLearnerIds,
  });

  for (const [organizationId, learners] of learnersToDeleteByOrganization) {
    await services.deleteOrganizationLearnersService({
      organizationLearners: learners,
      organizationId,
      userId,
      userRole,
      client,
    });
  }
};
