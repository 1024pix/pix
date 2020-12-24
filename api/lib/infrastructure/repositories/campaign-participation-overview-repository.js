const { knex } = require('../bookshelf');
const Assessment = require('../../domain/models/Assessment');
const Campaign = require('../../domain/models/Campaign');
const CampaignParticipationOverview = require('../../domain/read-models/CampaignParticipationOverview');

module.exports = {

  async findAllByUserId(userId) {
    const queryBuilder = _findByUserId({ userId });
    const rawCampaignParticipationOverviews = await queryBuilder;

    return rawCampaignParticipationOverviews.map((data) => {
      return new CampaignParticipationOverview(data);
    });
  },

  async findByUserIdWithFilters({ userId, states }) {
    const queryBuilder = _findByUserId({ userId });

    if (states.includes('ENDED')) {
      queryBuilder.modify(_filterWhithEndedState, states);
    } else {
      queryBuilder.modify(_filterByAssessmentStates, buildAssessementStates(states));
      queryBuilder.modify(_filterBySharedState, false);
      queryBuilder.whereNull('campaigns.archivedAt');
    }

    const rawCampaignParticipationOverviews = await queryBuilder;

    return rawCampaignParticipationOverviews.map((data) => {
      return new CampaignParticipationOverview(data);
    });
  },
};

function buildAssessementStates(states) {
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

function _findByUserId({ userId }) {
  return knex
    .select({
      id: 'campaign-participations.id',
      createdAt: 'campaign-participations.createdAt',
      isShared: 'campaign-participations.isShared',
      sharedAt: 'campaign-participations.sharedAt',
      campaignCode: 'campaigns.code',
      campaignTitle: 'campaigns.title',
      organizationName: 'organizations.name',
      assessmentState: 'assessments.state',
    })
    .from('campaign-participations')
    .innerJoin('campaigns', 'campaign-participations.campaignId', 'campaigns.id')
    .innerJoin('organizations', 'organizations.id', 'campaigns.organizationId')
    .leftJoin('assessments', 'assessments.campaignParticipationId', 'campaign-participations.id')
    .modify(_filterMostRecentAssessments)
    .where({
      'campaign-participations.userId': userId,
      'campaigns.type': Campaign.types.ASSESSMENT,
    })
    .orderBy('campaign-participations.createdAt', 'DESC');
}

function _filterMostRecentAssessments(queryBuilder) {
  queryBuilder
    .leftJoin({ 'newerAssessments': 'assessments' }, function() {
      this.on('newerAssessments.campaignParticipationId', 'campaign-participations.id')
        .andOn('assessments.createdAt', '<', knex.ref('newerAssessments.createdAt'));
    })
    .whereNull('newerAssessments.id');
}

function _filterByAssessmentStates(queryBuilder, assessmentStates) {
  if (assessmentStates.length > 0) {
    queryBuilder.whereIn('assessments.state', assessmentStates);
  }
}

function _filterBySharedState(queryBuilder, sharedState) {
  queryBuilder.where('campaign-participations.isShared', sharedState);
}

function _filterWhithEndedState(queryBuilder, states) {
  queryBuilder.andWhere(function() {
    if (states.length === 1) {
      this.where('campaign-participations.isShared', true);
    } else {
      this.modify(_filterByAssessmentStates, buildAssessementStates(states));
    }
    this.orWhereNotNull('campaigns.archivedAt');
  });
}
