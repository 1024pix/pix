import { logger } from '../../../../shared/infrastructure/utils/logger.js';
import { CouldNotDeleteLearnersError } from '../errors.js';
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

  if (organizationLearnerIds.length !== organizationLearnersToDelete.length) {
    logger.error(
      `User id ${userId} could not delete organization learners because some learner id in (${organizationLearnerIds.join(',')}) don't belong to organization id ${organizationId}`,
    );
    throw new CouldNotDeleteLearnersError();
  }

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
