const bluebird = require('bluebird');
const { knex } = require('../bookshelf');
const { fetchPage } = require('../utils/knex-utils');
const targetProfileRepository = require('./target-profile-with-learning-content-repository');
const CampaignAssessmentParticipationResultMinimal = require('../../domain/read-models/campaign-results/CampaignAssessmentParticipationResultMinimal');
const CampaignParticipationStatuses = require('../../domain/models/CampaignParticipationStatuses');

const { SHARED } = CampaignParticipationStatuses;

async function findPaginatedByCampaignId({ page = {}, campaignId, filters = {} }) {
  const targetProfile = await targetProfileRepository.getByCampaignId({ campaignId });
  const { results, pagination } = await _getResultListPaginated(campaignId, targetProfile, filters, page);

  const participations = await _buildCampaignAssessmentParticipationResultList(results);
  return {
    participations,
    pagination,
  };
}
async function _getResultListPaginated(campaignId, targetProfile, filters, page) {
  const query = _getParticipantsResultList(campaignId, targetProfile, filters);
  return fetchPage(query, page);
}

function _getParticipantsResultList(campaignId, targetProfile, filters) {
  return knex
    .with('campaign_participation_summaries', (qb) => _getParticipations(qb, campaignId, targetProfile, filters))
    .select('*')
    .from('campaign_participation_summaries')
    .modify(_filterByBadgeAcquisitionsOut, filters)
    .orderByRaw('LOWER(??) ASC, LOWER(??) ASC', ['lastName', 'firstName']);
}

function _getParticipations(qb, campaignId, targetProfile, filters) {
  qb.select(
    'organization-learners.firstName',
    'organization-learners.lastName',
    'campaign-participations.participantExternalId',
    'campaign-participations.masteryRate',
    'campaign-participations.id AS campaignParticipationId',
    'campaign-participations.userId'
  )
    .from('campaign-participations')
    .join('organization-learners', 'organization-learners.id', 'campaign-participations.organizationLearnerId')
    .where('campaign-participations.campaignId', '=', campaignId)
    .where('campaign-participations.status', '=', SHARED)
    .where('campaign-participations.isImproved', '=', false)
    .modify(_filterByDivisions, filters)
    .modify(_filterByGroups, filters)
    .modify(_addAcquiredBadgeids, filters)
    .modify(_filterByStage, targetProfile, filters);
}

function _filterByDivisions(qb, filters) {
  if (filters.divisions) {
    const divisionsLowerCase = filters.divisions.map((division) => division.toLowerCase());
    qb.whereRaw('LOWER("organization-learners"."division") = ANY(:divisionsLowerCase)', { divisionsLowerCase });
  }
}

function _filterByGroups(qb, filters) {
  if (filters.groups) {
    const groupsLowerCase = filters.groups.map((group) => group.toLowerCase());
    qb.whereIn(knex.raw('LOWER("organization-learners"."group")'), groupsLowerCase);
  }
}

function _addAcquiredBadgeids(qb, filters) {
  if (filters.badges) {
    qb.select(knex.raw('ARRAY_AGG("badgeId") OVER (PARTITION BY "campaign-participations"."id") as badges_acquired'))
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
      builder.orWhereBetween('campaign-participations.masteryRate', [boundary.from, boundary.to]);
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
