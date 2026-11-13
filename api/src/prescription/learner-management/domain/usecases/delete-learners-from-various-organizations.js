import { services } from '../services/index.js';

export const deleteLearnersFromVariousOrganizations = async function ({
  organizationLearnerIds,
  userId,
  userRole,
  client,
  organizationLearnerRepository,
}) {
  if (organizationLearnerIds.length === 0) return;

  const organizationLearnersToDelete = await organizationLearnerRepository.getLearnersGroupedByOrganizations({
    organizationLearnerIds,
  });

  if (organizationLearnersToDelete.length === 0) return;

  await services.deleteOrganizationLearnersService({
    organizationLearners: organizationLearnersToDelete,
    userId,
    userRole,
    client,
  });
};
