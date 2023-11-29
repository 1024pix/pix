import { knex } from '../../../db/knex-database-connection.js';
import { fetchPage } from '../utils/knex-utils.js';
import { TargetProfileSummaryForAdmin } from '../../domain/models/TargetProfileSummaryForAdmin.js';
import { DomainTransaction } from '../DomainTransaction.js';

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

const findByOrganization = async function ({ organizationId }) {
  const results = await knex('target-profiles')
    .select({
      id: 'target-profiles.id',
      name: 'target-profiles.name',
      outdated: 'target-profiles.outdated',
      isPublic: 'target-profiles.isPublic',
    })
    .leftJoin('target-profile-shares', function () {
      this.on('target-profile-shares.targetProfileId', 'target-profiles.id').on(
        'target-profile-shares.organizationId',
        organizationId,
      );
    })
    .where({ outdated: false })
    .where((qb) => {
      qb.orWhere({ isPublic: true });
      qb.orWhere({ ownerOrganizationId: organizationId });
      qb.orWhere((subQb) => {
        subQb.whereNotNull('target-profile-shares.id');
      });
    })
    .orderBy('id', 'ASC');

  return results.map((attributes) => new TargetProfileSummaryForAdmin(attributes));
};

const findByTraining = async function ({ trainingId, domainTransaction = DomainTransaction.emptyTransaction() }) {
  const knexConn = domainTransaction?.knexTransaction || knex;

  const results = await knexConn('target-profiles')
    .select({ id: 'target-profiles.id', name: 'target-profiles.name', outdated: 'target-profiles.outdated' })
    .innerJoin('target-profile-trainings', 'target-profiles.id', 'target-profile-trainings.targetProfileId')
    .where({ trainingId })
    .orderBy('id', 'ASC');

  return results.map((attributes) => new TargetProfileSummaryForAdmin(attributes));
};

export { findPaginatedFiltered, findByOrganization, findByTraining };

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
