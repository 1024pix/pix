import { DomainTransaction } from '../../../../shared/domain/DomainTransaction.js';

const removeByOrganizationLearnerIds = function ({ organizationLearnerIds, userId }) {
  const knexConnection = DomainTransaction.getConnection();
  return knexConnection('campaign-participations')
    .whereIn('organizationLearnerId', organizationLearnerIds)
    .whereNull('deletedAt')
    .update({ deletedAt: new Date(), deletedBy: userId });
};

export { removeByOrganizationLearnerIds };
