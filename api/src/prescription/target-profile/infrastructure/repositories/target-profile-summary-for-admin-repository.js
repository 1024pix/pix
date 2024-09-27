import { knex } from '../../../../../db/knex-database-connection.js';
import { DomainTransaction } from '../../../../../lib/infrastructure/DomainTransaction.js';
import { fetchPage } from '../../../../shared/infrastructure/utils/knex-utils.js';
import { TargetProfileSummaryForAdmin } from '../../domain/models/TargetProfileSummaryForAdmin.js';

const findPaginatedFiltered = async function ({ filter, page }) {
  const query = knex('target-profiles')
    .select('id', 'name', 'outdated', 'createdAt')
    .orderBy('outdated', 'ASC')
    .orderBy('name', 'ASC')
    .modify(_applyFilters, filter);

  const { results, pagination } = await fetchPage(query, page);

  const targetProfileSummaries = results.map((attributes) => new TargetProfileSummaryForAdmin(attributes));
  return { models: targetProfileSummaries, meta: { ...pagination } };
};

const findByTraining = async function ({ trainingId }) {
  const knexConn = DomainTransaction.getConnection();

  const results = await knexConn('target-profiles')
    .select({
      id: 'target-profiles.id',
      name: 'target-profiles.name',
      outdated: 'target-profiles.outdated',
      ownerOrganizationId: 'target-profiles.ownerOrganizationId',
    })
    .innerJoin('target-profile-trainings', 'target-profiles.id', 'target-profile-trainings.targetProfileId')
    .where({ trainingId })
    .orderBy('id', 'ASC');

  return results.map((attributes) => new TargetProfileSummaryForAdmin(attributes));
};

export { findByTraining, findPaginatedFiltered };

function _applyFilters(qb, filter) {
  const { name, id } = filter;
  if (name) {
    qb.whereILike('name', `%${name}%`);
  }
  if (id) {
    qb.where({ id });
  }
  return qb;
}
