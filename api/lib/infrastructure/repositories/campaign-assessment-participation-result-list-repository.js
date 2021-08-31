const bluebird = require('bluebird');
const { knex } = require('../bookshelf');
const { fetchPage } = require('../utils/knex-utils');
const targetProfileRepository = require('./target-profile-with-learning-content-repository');
const CampaignAssessmentParticipationResultMinimal = require('../../domain/read-models/campaign-results/CampaignAssessmentParticipationResultMinimal');

async function findPaginatedByCampaignId({ page = {}, campaignId, filters = {} }) {

  const targetProfile = await targetProfileRepository.getByCampaignId({ campaignId });
  const { results, pagination } = await _getResultListPaginated(campaignId, targetProfile, filters, page);

  const participations = await _buildCampaignAssessmentParticipationResultList(results);

  return {
    participations,
    pagination,
  };
}

function _getResultListPaginated(campaignId, targetProfile, filters, page) {
  const query = _getParticipantsResultList(campaignId, targetProfile, filters);
  return fetchPage(query, page);
}

function _getParticipantsResultList(campaignId, targetProfile, filters) {
  return knex.with('campaign_participation_summaries', (qb) => _getParticipations(qb, campaignId, targetProfile, filters))
    .select('*')
    .from('campaign_participation_summaries')
    .modify(_filterByBadgeAcquisitionsOut, filters)
    .orderByRaw('LOWER(??) ASC, LOWER(??) ASC', ['lastName', 'firstName']);
}

function _getParticipations(qb, campaignId, targetProfile, filters) {
  qb.select(
    knex.raw('COALESCE ("schooling-registrations"."firstName", "users"."firstName") AS "firstName"'),
    knex.raw('COALESCE ("schooling-registrations"."lastName", "users"."lastName") AS "lastName"'),
    'campaign-participations.participantExternalId',
    'campaign-participations.masteryPercentage',
    'campaign-participations.id AS campaignParticipationId',
    'users.id AS userId',
  )
    .from('campaign-participations')
    .join('users', 'users.id', 'campaign-participations.userId')
    .join('campaigns', 'campaigns.id', 'campaign-participations.campaignId')
    .leftJoin('schooling-registrations', function() {
      this.on({ 'campaign-participations.userId': 'schooling-registrations.userId' })
        .andOn({ 'campaigns.organizationId': 'schooling-registrations.organizationId' });
    })
    .where('campaign-participations.campaignId', '=', campaignId)
    .where('campaign-participations.isShared', '=', true)
    .where('campaign-participations.isImproved', '=', false)
    .modify(_filterByDivisions, filters)
    .modify(_addAcquiredBadgeids, filters)
    .modify(_filterByStage, targetProfile, filters);
}

function _filterByDivisions(qb, filters) {
  if (filters.divisions) {
    const divisionsLowerCase = filters.divisions.map((division) => division.toLowerCase());
    qb.whereRaw('LOWER("schooling-registrations"."division") = ANY(:divisionsLowerCase)', { divisionsLowerCase });
  }
}

function _addAcquiredBadgeids(qb, filters) {
  if (filters.badges) {
    qb.select(
      knex.raw('ARRAY_AGG("badgeId") OVER (PARTITION BY "campaign-participations"."id") as badges_acquired'),
    )
      .join('badge-acquisitions', 'badge-acquisitions.campaignParticipationId', 'campaign-participations.id')
      .distinct('campaign-participations.id');
  }
}

function _filterByBadgeAcquisitionsOut(qb, filters) {
  if (filters.badges) {
    qb.whereRaw(':badgeIds <@ "badges_acquired"', { badgeIds: filters.badges });
  }
}

function _filterByStage(qb, targetProfile, filters) {
  if (!filters.stages) return;

  const thresholdBoundaries = targetProfile.getThresholdBoundariesFromStages(filters.stages);
  const thresholdRateBoundaries = thresholdBoundaries.map((boundary) => ({
    id: boundary.id,
    from: boundary.from / 100,
    to: boundary.to / 100,
  }));
  qb.where((builder) => {
    thresholdRateBoundaries.forEach((boundary) => {
      builder.orWhereBetween('campaign-participations.masteryPercentage', [boundary.from, boundary.to]);
    });
  });
}

async function _buildCampaignAssessmentParticipationResultList(results) {

  return await bluebird.mapSeries(results, async (result) => {
    const badges = await getAcquiredBadges(result.campaignParticipationId);

    return new CampaignAssessmentParticipationResultMinimal({
      ...result,
      badges,
    });
  });
}

async function getAcquiredBadges(campaignParticipationId) {
  return await knex('badge-acquisitions')
    .select(['badges.id AS id', 'title', 'altMessage', 'imageUrl'])
    .join('badges', 'badges.id', 'badge-acquisitions.badgeId')
    .where({ campaignParticipationId: campaignParticipationId });
}

module.exports = {
  findPaginatedByCampaignId,
};
