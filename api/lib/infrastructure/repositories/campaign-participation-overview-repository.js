const { knex } = require('../bookshelf');
const Assessment = require('../../domain/models/Assessment');
const Campaign = require('../../domain/models/Campaign');
const CampaignParticipationOverview = require('../../domain/read-models/CampaignParticipationOverview');
const { fetchPage } = require('../utils/knex-utils');

module.exports = {

  async findByUserIdWithFilters({ userId, states, page }) {
    const queryBuilder = _findByUserId({ userId });

    if (states && states.length > 0) {
      _filterByStates(queryBuilder, states);
    }

    const { results, pagination } = await fetchPage(queryBuilder, page);
    const campaignParticipationOverviews = _toReadModel(results);

    return {
      campaignParticipationOverviews,
      pagination,
    };
  },
};

function _findByUserId({ userId }) {
  return knex
    .select({
      id: 'campaign-participations.id',
      createdAt: 'campaign-participations.createdAt',
      isShared: 'campaign-participations.isShared',
      sharedAt: 'campaign-participations.sharedAt',
      validatedSkillsCount: 'campaign-participations.validatedSkillsCount',
      campaignCode: 'campaigns.code',
      campaignTitle: 'campaigns.title',
      targetProfileId: 'campaigns.targetProfileId',
      organizationName: 'organizations.name',
      assessmentState: 'assessments.state',
    })
    .from('campaign-participations')
    .innerJoin('campaigns', 'campaign-participations.campaignId', 'campaigns.id')
    .innerJoin('organizations', 'organizations.id', 'campaigns.organizationId')
    .leftJoin('assessments', 'assessments.campaignParticipationId', 'campaign-participations.id')
    .modify(_filterMostRecentAssessments)
    .where('campaign-participations.userId', userId)
    .where('campaigns.type', Campaign.types.ASSESSMENT)
    .whereNull('campaigns.archivedAt')
    .orderBy('campaign-participations.sharedAt', 'DESC')
    .orderBy('assessments.state', 'ASC')
    .orderBy('assessments.createdAt', 'DESC');
}

function _filterMostRecentAssessments(queryBuilder) {
  queryBuilder
    .leftJoin({ 'newerAssessments': 'assessments' }, function() {
      this.on('newerAssessments.campaignParticipationId', 'campaign-participations.id')
        .andOn('assessments.createdAt', '<', knex.ref('newerAssessments.createdAt'));
    })
    .whereNull('newerAssessments.id');
}

function _filterByStates(queryBuilder, states) {
  queryBuilder.modify(_filterByAssessmentStates, states);

  if (states.includes('ENDED') && states.length === 1) {
    queryBuilder.where('campaign-participations.isShared', true);
  } else if (!states.includes('ENDED')) {
    queryBuilder.where('campaign-participations.isShared', false);
  }
}

function _filterByAssessmentStates(queryBuilder, states) {
  const assessmentStates = _buildAssessmentStates(states);
  if (assessmentStates.length > 0) {
    queryBuilder.whereIn('assessments.state', assessmentStates);
  }
}

function _buildAssessmentStates(states) {
  const assessmentStates = [];

  states.forEach((state) => {
    if (state === 'ONGOING') {
      assessmentStates.push(Assessment.states.STARTED);
    } else if (state === 'TO_SHARE') {
      assessmentStates.push(Assessment.states.COMPLETED);
    }
  });

  return assessmentStates;
}

function _toReadModel(campaignParticipationOverviews) {
  return campaignParticipationOverviews.map((data) => {
    return new CampaignParticipationOverview(data);
  });
}
