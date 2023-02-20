import { knex } from '../../../db/knex-database-connection';
import { fetchPage } from '../utils/knex-utils';
import TargetProfileSummaryForAdmin from '../../domain/models/TargetProfileSummaryForAdmin';
import DomainTransaction from '../DomainTransaction';

export default {
  async findPaginatedFiltered({ filter, page }) {
    const query = knex('target-profiles')
      .select('id', 'name', 'outdated')
      .orderBy('id', 'ASC')
      .modify(_applyFilters, filter);

    const { results, pagination } = await fetchPage(query, page);

    const targetProfileSummaries = results.map((attributes) => new TargetProfileSummaryForAdmin(attributes));
    return { models: targetProfileSummaries, meta: { ...pagination } };
  },

  async findByOrganization({ organizationId }) {
    const results = await knex('target-profiles')
      .select({
        id: 'target-profiles.id',
        name: 'target-profiles.name',
        outdated: 'target-profiles.outdated',
      })
      .leftJoin('target-profile-shares', function () {
        this.on('target-profile-shares.targetProfileId', 'target-profiles.id').on(
          'target-profile-shares.organizationId',
          organizationId
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
  },

  async findByTraining({ trainingId, domainTransaction = DomainTransaction.emptyTransaction() }) {
    const knexConn = domainTransaction?.knexTransaction || knex;

    const results = await knexConn('target-profiles')
      .select({ id: 'target-profiles.id', name: 'target-profiles.name', outdated: 'target-profiles.outdated' })
      .innerJoin('target-profile-trainings', 'target-profiles.id', 'target-profile-trainings.targetProfileId')
      .where({ trainingId })
      .orderBy('id', 'ASC');

    return results.map((attributes) => new TargetProfileSummaryForAdmin(attributes));
  },
};

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
