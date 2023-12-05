import { knex } from '../../../db/knex-database-connection.js';
import { CampaignTypes } from '../../../src/prescription/campaign/domain/read-models/CampaignTypes.js';
import { fetchPage } from '../utils/knex-utils.js';
import { CampaignParticipationStatuses } from '../../../src/prescription/shared/domain/constants.js';
import { CampaignParticipationOverview } from '../../domain/read-models/CampaignParticipationOverview.js';

const findByUserIdWithFilters = async function ({ userId, states, page }) {
  const queryBuilder = _findByUserId({ userId });

  if (states && states.length > 0) {
    _filterByStates(queryBuilder, states);
  }

  const { results, pagination } = await fetchPage(queryBuilder, page);

  return {
    campaignParticipationOverviews: results.map(
      (campaignParticipationOverview) => new CampaignParticipationOverview(campaignParticipationOverview),
    ),
    pagination,
  };
};

export { findByUserIdWithFilters };

function _findByUserId({ userId }) {
  return knex
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
        targetProfileId: 'campaigns.targetProfileId',
        campaignArchivedAt: 'campaigns.archivedAt',
        organizationName: 'organizations.name',
        deletedAt: 'campaign-participations.deletedAt',
        participationState: _computeCampaignParticipationState(),
        campaignId: 'campaigns.id',
      })
        .from('campaign-participations')
        .innerJoin('campaigns', 'campaign-participations.campaignId', 'campaigns.id')
        .innerJoin('organizations', 'organizations.id', 'campaigns.organizationId')
        .where('campaign-participations.userId', userId)
        .where('campaign-participations.isImproved', false)
        .where('campaigns.type', CampaignTypes.ASSESSMENT)
        .whereNot('campaigns.isForAbsoluteNovice', true);
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
