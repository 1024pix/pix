const { knex } = require('../../../db/knex-database-connection.js');
const CampaignTypes = require('../../domain/models/CampaignTypes.js');
const CampaignParticipationOverview = require('../../domain/read-models/CampaignParticipationOverview.js');
const { fetchPage } = require('../utils/knex-utils.js');
const bluebird = require('bluebird');
const CampaignParticipationStatuses = require('../../domain/models/CampaignParticipationStatuses.js');
const campaignRepository = require('./campaign-repository.js');
const CampaignStages = require('../../domain/read-models/campaign/CampaignStages.js');

module.exports = {
  async findByUserIdWithFilters({ userId, states, page }) {
    const queryBuilder = _findByUserId({ userId });

    if (states && states.length > 0) {
      _filterByStates(queryBuilder, states);
    }

    const { results, pagination } = await fetchPage(queryBuilder, page);

    const campaignParticipationOverviews = await _toReadModel(results);

    return {
      campaignParticipationOverviews,
      pagination,
    };
  },
};

function _findByUserId({ userId }) {
  return knex
    .with('campaign-participation-overviews', (qb) => {
      qb.select({
        id: 'campaign-participations.id',
        createdAt: 'campaign-participations.createdAt',
        status: 'campaign-participations.status',
        sharedAt: 'campaign-participations.sharedAt',
        masteryRate: 'campaign-participations.masteryRate',
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
    [CampaignParticipationStatuses.STARTED, CampaignParticipationStatuses.SHARED]
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

function _toReadModel(campaignParticipationOverviews) {
  return bluebird.mapSeries(campaignParticipationOverviews, async (data) => {
    const stages = await campaignRepository.findStages({ campaignId: data.campaignId });
    const campaignStages = new CampaignStages({ stages });

    return new CampaignParticipationOverview({
      ...data,
      campaignStages,
    });
  });
}
