import { OrganizationLearnerList } from '../models/OrganizationLearnerList.js';
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
  if (organizationLearnerIds.length === 0) {
    return;
  }

  const organizationLearnersFromOrganization =
    await organizationLearnerRepository.findOrganizationLearnersByOrganizationIdAndLearnerIds({
      organizationId,
      organizationLearnerIds,
    });

  const organizationLearnerList = new OrganizationLearnerList({
    organizationId,
    organizationLearners: organizationLearnersFromOrganization,
  });

  const organizationLearnersToDelete = organizationLearnerList.getDeletableOrganizationLearners(
    organizationLearnerIds,
    userId,
  );

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
