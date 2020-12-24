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

  async findOngoingByUserId(userId) {
    const queryBuilder = _findByUserId({ userId });
    queryBuilder.modify(_filterByAssessmentStates, [Assessment.states.STARTED]);
    queryBuilder.modify(_filterBySharedState, false);
    queryBuilder.modify(_filterByCampaignArchivedState, false);

    const rawCampaignParticipationOverviews = await queryBuilder;

    return rawCampaignParticipationOverviews.map((data) => {
      return new CampaignParticipationOverview(data);
    });
  },

  async findToShareByUserId(userId) {
    const queryBuilder = _findByUserId({ userId });
    queryBuilder.modify(_filterByAssessmentStates, [Assessment.states.COMPLETED]);
    queryBuilder.modify(_filterBySharedState, false);
    queryBuilder.modify(_filterByCampaignArchivedState, false);

    const rawCampaignParticipationOverviews = await queryBuilder;

    return rawCampaignParticipationOverviews.map((data) => {
      return new CampaignParticipationOverview(data);
    });
  },

  async findByUserIdWithFilters({ userId, states }) {
    const queryBuilder = _findByUserId({ userId });

    const assessmentStates = [];

    states.forEach((state) => {
      if (state === 'ONGOING') {
        assessmentStates.push(Assessment.states.STARTED);
      } else if (state === 'TO_SHARE') {
        assessmentStates.push(Assessment.states.COMPLETED);
      }
    });

    queryBuilder.modify(_filterByAssessmentStates, assessmentStates);
    queryBuilder.modify(_filterBySharedState, false);
    queryBuilder.modify(_filterByCampaignArchivedState, false);

    const rawCampaignParticipationOverviews = await queryBuilder;

    return rawCampaignParticipationOverviews.map((data) => {
      return new CampaignParticipationOverview(data);
    });
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

function _filterByAssessmentStates(queryBuilder, assessmentStates) {
  if (assessmentStates) {
    queryBuilder.whereIn('assessments.state', assessmentStates);
  }
}

function _filterBySharedState(queryBuilder, sharedState) {
  queryBuilder.where('campaign-participations.isShared', sharedState);
}

function _filterByCampaignArchivedState(queryBuilder, archivedState) {
  if (archivedState) {
    queryBuilder.whereNotNull('campaigns.archivedAt');
  } else {
    queryBuilder.whereNull('campaigns.archivedAt');
  }
}
