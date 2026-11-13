import { services } from '../services/index.js';

const deleteOrganizationLearners = async function ({
  organizationLearnerIds,
  userId,
  organizationId,
  userRole,
  client,
  disableAuditLogger = false, // true in case of dryRun to not instantiate jobs
  organizationLearnerRepository,
}) {
  if (organizationLearnerIds.length === 0) return;

  const organizationLearnersToDelete =
    await organizationLearnerRepository.findOrganizationLearnersByOrganizationIdAndLearnerIds({
      organizationId,
      organizationLearnerIds,
    });

  if (organizationLearnersToDelete.length === 0) return;

  await services.deleteOrganizationLearnersService({
    organizationLearners: organizationLearnersToDelete,
    userId,
    organizationId,
    userRole,
    client,
    disableAuditLogger,
  });
};

export { deleteOrganizationLearners };
