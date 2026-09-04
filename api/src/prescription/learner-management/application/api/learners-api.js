import { withTransaction } from '../../../../shared/domain/DomainTransaction.js';
import { usecases } from '../../domain/usecases/index.js';

/**
 * Check if user has been a learner of an organization
 *
 * @param {object} params
 * @param {number} params.userId - The ID of the user to check
 * @returns {Promise<boolean>}
 * @throws TypeError - Throw when params.userId is not defined
 */
export const hasBeenLearner = async ({ userId }) => {
  if (!userId) {
    throw new TypeError('userId is required');
  }

  const isLearner = await usecases.hasBeenLearner({ userId });

  return isLearner;
};

/**
 * delete organization learner before adding import feature
 *
 * @param {object} params
 * @param {number} params.userId - The ID of the user wich request the action
 * @param {number} params.organizationId - The ID of the organizationId to find learner to delete
 * @returns {Promise<void>}
 * @throws TypeError - Throw when params.userId or params.organizationId is not defined
 */
export const deleteOrganizationLearnerBeforeImportFeature = withTransaction(async ({ userId, organizationId }) => {
  if (!userId) {
    throw new TypeError('userId is required');
  }

  if (!organizationId) {
    throw new TypeError('organizationId is required');
  }

  const organizationLearnerIds = await usecases.findOrganizationLearnersBeforeImportFeature({ organizationId });

  return usecases.deleteOrganizationLearners({
    userId,
    organizationId,
    organizationLearnerIds,
    userRole: 'SUPER_ADMIN',
    client: 'PIX_ADMIN',
  });
});
