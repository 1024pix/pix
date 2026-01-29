import { knex } from '../../../../../db/knex-database-connection.js';
import { DomainTransaction } from '../../../../shared/domain/DomainTransaction.js';

const update = async function (targetProfile) {
  const knexConn = DomainTransaction.getConnection();
  const results = await knexConn('target-profile-shares')
    .where('targetProfileId', targetProfile.id)
    .whereIn('organizationId', targetProfile.organizationIdsToDetach)
    .del()
    .returning('organizationId');
  return results.map(({ organizationId }) => organizationId);
};

export { update };
