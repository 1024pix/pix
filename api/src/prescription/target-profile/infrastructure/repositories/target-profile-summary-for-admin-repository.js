import { knex } from '../../../../../db/knex-database-connection.js';
import * as CombinedCourseRepository from '../../../../quest/infrastructure/repositories/combined-course-repository.js';
import { DomainTransaction } from '../../../../shared/domain/DomainTransaction.js';
import { fetchPage } from '../../../../shared/infrastructure/utils/knex-utils.js';
import { TargetProfileSummaryForAdmin } from '../../domain/models/TargetProfileSummaryForAdmin.js';

const findPaginatedFiltered = async function ({ filter, page }) {
  const knexConn = DomainTransaction.getConnection();
  const query = knex('target-profiles')
    .select('id', 'internalName', 'outdated', 'category', 'createdAt')
    .orderBy('outdated', 'ASC')
    .orderBy('internalName', 'ASC')
    .modify(_applyFilters, filter);

  const { results, pagination } = await fetchPage({ queryBuilder: query, paginationParams: page, trx: knexConn });

  const targetProfileSummaries = results.map((attributes) => new TargetProfileSummaryForAdmin(attributes));
  return { models: targetProfileSummaries, meta: { ...pagination } };
};

const findByTraining = async function ({ trainingId }) {
  const knexConn = DomainTransaction.getConnection();

  const results = await knexConn('target-profiles')
    .select({
      id: 'target-profiles.id',
      internalName: 'target-profiles.internalName',
      outdated: 'target-profiles.outdated',
      ownerOrganizationId: 'target-profiles.ownerOrganizationId',
    })
    .innerJoin('target-profile-trainings', 'target-profiles.id', 'target-profile-trainings.targetProfileId')
    .where({ trainingId })
    .orderBy('id', 'ASC');

  const targetProfileIds = results.map((result) => result.id);
  const campaignsByTargetProfile = await knexConn('campaigns')
    .select('id', 'targetProfileId')
    .whereIn('targetProfileId', targetProfileIds);

  const campaignsMap = {};

  for (const campaign of campaignsByTargetProfile) {
    if (!campaignsMap[campaign.targetProfileId]) {
      campaignsMap[campaign.targetProfileId] = [];
    }
    campaignsMap[campaign.targetProfileId].push(campaign.id);
  }

  const targetProfileSummaries = [];

  for (const result of results) {
    const relatedCampaignIds = campaignsMap[result.id] || [];
    let isPartOfCombinedCourse = false;
    for (const relatedCampaignId of relatedCampaignIds) {
      const combinedCourse = await CombinedCourseRepository.findByCampaignId({ campaignId: relatedCampaignId });
      isPartOfCombinedCourse = combinedCourse.length === 1;
    }
    targetProfileSummaries.push(
      new TargetProfileSummaryForAdmin({
        ...result,
        isPartOfCombinedCourse,
      }),
    );
  }

  return targetProfileSummaries;
};

export { findByTraining, findPaginatedFiltered };

function _applyFilters(qb, filter) {
  const { internalName, id, categories } = filter;
  if (internalName) {
    qb.whereILike('internalName', `%${internalName}%`);
  }
  if (id) {
    qb.where({ id });
  }
  if (categories) {
    qb.whereIn('category', categories);
  }
  return qb;
}
