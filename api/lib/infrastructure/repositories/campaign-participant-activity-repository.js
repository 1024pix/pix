const { knex } = require('../bookshelf');
const { fetchPage } = require('../utils/knex-utils');
const bluebird = require('bluebird');
const CampaignParticipantActivity = require('../../domain/read-models/CampaignParticipantActivity');
const Progression = require('../../../lib/domain/models/Progression');
const KnowledgeElementRepository = require('./knowledge-element-repository');
const Campaign = require('../../domain/models/Campaign');

const campaignParticipantActivityRepository = {

  async findPaginatedByCampaignId({ page = { size: 25 }, campaignId }) {

    const targetedSkills = await _getTargetedSkills(campaignId);

    const query = knex
      .with('with_assessements', (qb) => withOrderAndLimit(qb, campaignId))
      .select('with_assessements.*', 'assessments.state AS assessmentState')
      .from('with_assessements')
      .leftJoin('assessments', 'assessments.campaignParticipationId', 'with_assessements.campaignParticipationId')
      .whereNotExists(
        knex('assessments AS newerAssessments')
          .select('id')
          .where('newerAssessments.campaignParticipationId', '=', knex.raw('"assessments"."campaignParticipationId"'))
          .where('newerAssessments.createdAt', '>', knex.raw('"assessments"."createdAt"'))
          .where('newerAssessments.id', '!=', knex.raw('"assessments"."id"')),
      );
    const { results, pagination } = await fetchPage(query, page);

    const campaignParticipantsActivities = await bluebird.mapSeries(results, (result) => _buildCampaignParticipationActivity(result, targetedSkills));

    return {
      campaignParticipantsActivities,
      pagination,
    };
  },
};

function _campaignParticipationByParticipantSortedByDate(qb, campaignId) {
  qb.select(
    'campaign-participations.id AS campaignParticipationId',
    'users.id AS userId',
    knex.raw('COALESCE ("schooling-registrations"."firstName", "users"."firstName") AS "firstName"'),
    knex.raw('COALESCE ("schooling-registrations"."lastName", "users"."lastName") AS "lastName"'),
    'campaign-participations.participantExternalId',
    'campaign-participations.sharedAt',
    'campaign-participations.isShared',
    'assessments.state AS assessmentState',
    'campaigns.type AS campaignType',
  )
    .from('campaign-participations')
    .join('users', 'users.id', 'campaign-participations.userId')
    .join('campaigns', 'campaigns.id', 'campaign-participations.campaignId')
    .leftJoin('assessments', 'assessments.campaignParticipationId', 'campaign-participations.id')
    .leftJoin('schooling-registrations', function() {
      this.on({ 'campaign-participations.userId': 'schooling-registrations.userId' })
        .andOn({ 'campaigns.organizationId': 'schooling-registrations.organizationId' });
    })
    .where('campaign-participations.campaignId', '=', campaignId)
    .where('campaign-participations.isImproved', '=', false)
    .modify(_filterMostRecentAssessments);
}

function _filterMostRecentAssessments(qb) {
  qb
    .leftJoin({ 'newerAssessments': 'assessments' }, function() {
      this.on('newerAssessments.campaignParticipationId', 'campaign-participations.id')
        .andOn('assessments.createdAt', '<', 'newerAssessments.createdAt');
    })
    .whereNull('newerAssessments.id');
}

async function _buildCampaignParticipationActivity(result, targetedSkills) {
  if (result.campaignType === Campaign.types.PROFILES_COLLECTION) {
    return new CampaignParticipantActivity(result);
  }

  const knowledgeElements = await KnowledgeElementRepository.findUniqByUserId({ userId: result.userId });
  const progression = new Progression({
    id: result.userId,
    targetedSkills,
    knowledgeElements,
    isProfileCompleted: result.isShared,
  });
  return new CampaignParticipantActivity({ ...result, progression: progression.completionRate });
}

async function _getTargetedSkills(campaignId) {
  return await knex('target-profiles_skills')
    .select({ 'id': 'skillId' })
    .join('campaigns', 'campaigns.targetProfileId', 'target-profiles_skills.targetProfileId')
    .where('campaigns.id', '=', campaignId);
}

function withOrderAndLimit(queryBuilder, campaignId) {
  queryBuilder
    .with('campaign_participants_activities_ordered', (qb) => _campaignParticipationByParticipantSortedByDate(qb, campaignId))
    .from('campaign_participants_activities_ordered')
    .orderByRaw('LOWER(??) ASC, LOWER(??) ASC', ['lastName', 'firstName']);
}
module.exports = campaignParticipantActivityRepository;
