import { knex } from '../../../../../db/knex-database-connection.js';
import { constants } from '../../../../shared/domain/constants.js';
import { DomainTransaction } from '../../../../shared/domain/DomainTransaction.js';
import { fetchPage } from '../../../../shared/infrastructure/utils/knex-utils.js';
import { CampaignParticipationStatuses, CampaignTypes } from '../../../shared/domain/constants.js';
import { CampaignParticipationOverview } from '../../../shared/domain/read-models/CampaignParticipationOverview.js';

const findByUserIdWithFilters = async function ({ userId, states, page }) {
  const queryBuilder = _getQueryBuilder((qb) => {
    qb.where('campaign-participations.userId', userId);
  });

  if (states && states.length > 0) {
    _filterByStates(queryBuilder, states);
  }

  const { results, pagination } = await fetchPage({
    queryBuilder,
    paginationParams: page,
  });
  return {
    campaignParticipationOverviews: results.map(
      (campaignParticipationOverview) => new CampaignParticipationOverview(campaignParticipationOverview),
    ),
    pagination,
  };
};

const findByOrganizationLearnerId = async ({ organizationLearnerId }) => {
  const results = await _getQueryBuilder((qb) => {
    qb.where('campaign-participations.organizationLearnerId', organizationLearnerId);
  });
  return results.map((result) => new CampaignParticipationOverview(result));
};

export { findByOrganizationLearnerId, findByUserIdWithFilters };

function _getQueryBuilder(callback) {
  const knexConn = DomainTransaction.getConnection();

  return knexConn
    .with('campaign-participation-overviews', (qb) => {
      qb.select({
        id: 'campaign-participations.id',
        createdAt: 'campaign-participations.createdAt',
        status: 'campaign-participations.status',
        sharedAt: 'campaign-participations.sharedAt',
        masteryRate: 'campaign-participations.masteryRate',
        validatedSkillsCount: 'campaign-participations.validatedSkillsCount',
        campaignCode: 'campaigns.code',
        campaignTitle: 'campaigns.title',
        campaignName: 'campaigns.name',
        targetProfileId: 'campaigns.targetProfileId',
        campaignArchivedAt: 'campaigns.archivedAt',
        organizationName: 'organizations.name',
        deletedAt: 'campaign-participations.deletedAt',
        participationState: _computeCampaignParticipationState(),
        campaignId: 'campaigns.id',
        isCampaignMultipleSendings: 'campaigns.multipleSendings',
        isOrganizationLearnerDisabled: 'view-active-organization-learners.isDisabled',
        campaignType: 'campaigns.type',
      })
        .from('campaign-participations')
        .join('campaigns', 'campaign-participations.campaignId', 'campaigns.id')
        .join('organizations', 'organizations.id', 'campaigns.organizationId')
        .leftJoin(
          'view-active-organization-learners',
          'view-active-organization-learners.id',
          'campaign-participations.organizationLearnerId',
        )
        .whereIn('campaigns.type', [CampaignTypes.ASSESSMENT, CampaignTypes.EXAM])
        .where('campaigns.isForAbsoluteNovice', false)
        .whereNot('organizations.id', constants.AUTONOMOUS_COURSES_ORGANIZATION_ID)
        .where('campaign-participations.isImproved', false)
        .where(callback);
    })
    .from('campaign-participation-overviews')
    .orderByRaw(_computeCampaignParticipationOrder())
    .orderByRaw(_sortEndedBySharedAt())
    .orderBy('createdAt', 'DESC');
}

function _computeCampaignParticipationState() {
  return knex.raw(
    `
  CASE
    WHEN campaigns."archivedAt" IS NOT NULL THEN 'DISABLED'
    WHEN "campaign-participations"."deletedAt" IS NOT NULL THEN 'DISABLED'
    WHEN "campaign-participations"."status" = ? THEN 'ONGOING'
    WHEN "campaign-participations"."status" = ? THEN 'ENDED'
    ELSE 'TO_SHARE'
  END`,
    [CampaignParticipationStatuses.STARTED, CampaignParticipationStatuses.SHARED],
  );
}

function _computeCampaignParticipationOrder() {
  return `
  CASE
    WHEN "participationState" = 'TO_SHARE' THEN 1
    WHEN "participationState" = 'ONGOING'  THEN 2
    WHEN "participationState" = 'ENDED'    THEN 3
    WHEN "participationState" = 'DISABLED' THEN 4
  END`;
}

function _sortEndedBySharedAt() {
  return `
  CASE
    WHEN "participationState" = 'ENDED' THEN "sharedAt"
    ELSE "createdAt"
  END DESC`;
}

function _filterByStates(queryBuilder, states) {
  queryBuilder.whereIn('participationState', states);
}
