import { knex } from '../../../../db/knex-database-connection.js';
import { DomainTransaction } from '../../../shared/domain/DomainTransaction.js';
import { ParticipantRepartition } from '../../domain/models/ParticipantRepartition.js';

/**
 * @function
 * @name findAllLearnerWithAtLeastOneParticipationByOrganizationId
 * @typedef {number} organizationId
 * @returns {Promise<ParticipantRepartition>}
 */
const findAllLearnerWithAtLeastOneParticipationByOrganizationId = async function (organizationId) {
  // This code should be called via an internal API
  // as it is a Prescription domain responsability
  const knexConn = DomainTransaction.getConnection();
  const result = await knexConn
    .select('users.isAnonymous')
    .distinct('view-active-organization-learners.id')
    .from('view-active-organization-learners')
    .join('users', 'users.id', 'view-active-organization-learners.userId')
    .join('campaign-participations', function () {
      this.on('campaign-participations.organizationLearnerId', 'view-active-organization-learners.id').andOnVal(
        'campaign-participations.deletedAt',
        knex.raw('IS'),
        knex.raw('NULL'),
      );
    })
    .where({ organizationId });

  return new ParticipantRepartition(result);
};

export { findAllLearnerWithAtLeastOneParticipationByOrganizationId };
