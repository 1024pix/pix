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

    const { results, pagination } = await _paginateQuery(queryBuilder, page);
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

function _filterByStates(queryBuilder, states) {
  if (states.includes('ENDED')) {
    queryBuilder.modify(_filterWithEndedState, states);
  } else {
    queryBuilder.modify(_filterByAssessmentStates, _buildAssessmentStates(states));
    queryBuilder.modify(_filterBySharedState, false);
    queryBuilder.whereNull('campaigns.archivedAt');
  }
}

function _filterWithEndedState(queryBuilder, states) {
  queryBuilder.andWhere(function() {
    if (states.length === 1) {
      this.where('campaign-participations.isShared', true);
    } else {
      this.modify(_filterByAssessmentStates, _buildAssessmentStates(states));
    }
    this.orWhereNotNull('campaigns.archivedAt');
  });
}

function _filterByAssessmentStates(queryBuilder, assessmentStates) {
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

function _filterBySharedState(queryBuilder, sharedState) {
  queryBuilder.where('campaign-participations.isShared', sharedState);
}

async function _paginateQuery(queryBuilder, page) {
  return await fetchPage(queryBuilder, page);
}

function _toReadModel(campaignParticipationOverviews) {
  return campaignParticipationOverviews.map((data) => {
    return new CampaignParticipationOverview(data);
  });
}
