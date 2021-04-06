const { knex } = require('../bookshelf');
const Assessment = require('../../domain/models/Assessment');
const CampaignParticipationOverview = require('../../domain/read-models/CampaignParticipationOverview');
const { fetchPage } = require('../utils/knex-utils');
const targetProfileWithLearningContentRepository = require('../../../lib/infrastructure/repositories/target-profile-with-learning-content-repository.js');
const bluebird = require('bluebird');

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
        isShared: 'campaign-participations.isShared',
        sharedAt: 'campaign-participations.sharedAt',
        validatedSkillsCount: 'campaign-participations.validatedSkillsCount',
        campaignCode: 'campaigns.code',
        campaignTitle: 'campaigns.title',
        targetProfileId: 'campaigns.targetProfileId',
        campaignArchivedAt: 'campaigns.archivedAt',
        organizationName: 'organizations.name',
        assessmentState: 'assessments.state',
        assessmentCreatedAt: 'assessments.createdAt',
        participationState: _computeCampaignParticipationState(),
      })
        .from('campaign-participations')
        .innerJoin('campaigns', 'campaign-participations.campaignId', 'campaigns.id')
        .innerJoin('organizations', 'organizations.id', 'campaigns.organizationId')
        .innerJoin('assessments', 'assessments.campaignParticipationId', 'campaign-participations.id')
        .modify(_filterMostRecentAssessments)
        .where('campaign-participations.userId', userId)
        .whereNot('campaigns.isForAbsoluteNovice', true);
    })
    .from('campaign-participation-overviews')
    .orderByRaw(_computeCampaignParticipationOrder())
    .orderByRaw(_sortEndedBySharedAt())
    .orderBy('createdAt', 'DESC');
}

function _computeCampaignParticipationState() {
  // eslint-disable-next-line no-restricted-syntax
  return knex.raw(`
  CASE
    WHEN campaigns."archivedAt" IS NOT NULL THEN 'ARCHIVED'
    WHEN assessments.state = ? THEN 'ONGOING'
    WHEN "isShared" IS true THEN 'ENDED'
    ELSE 'TO_SHARE'
  END`, Assessment.states.STARTED) ;
}

function _filterMostRecentAssessments(queryBuilder) {
  queryBuilder
    .leftJoin({ 'newerAssessments': 'assessments' }, function() {
      this.on('newerAssessments.campaignParticipationId', 'campaign-participations.id')
        .andOn('assessments.createdAt', '<', knex.ref('newerAssessments.createdAt'));
    })
    .whereNull('newerAssessments.id');
}

function _computeCampaignParticipationOrder() {
  return `
  CASE
    WHEN "participationState" = 'TO_SHARE' THEN 1
    WHEN "participationState" = 'ONGOING'  THEN 2
    WHEN "participationState" = 'ENDED'    THEN 3
    WHEN "participationState" = 'ARCHIVED' THEN 4
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
  return bluebird.mapSeries(campaignParticipationOverviews,
    async(data) => {
      const targetProfile = await targetProfileWithLearningContentRepository.get({ id: data.targetProfileId });

      return new CampaignParticipationOverview({
        ...data,
        targetProfile,
      });
    });
}
