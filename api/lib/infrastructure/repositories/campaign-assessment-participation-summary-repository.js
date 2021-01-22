const _ = require('lodash');
const bluebird = require('bluebird');
const { knex } = require('../bookshelf');
const constants = require('../constants');
const { fetchPage } = require('../utils/knex-utils');
const targetProfileRepository = require('./target-profile-repository');
const knowledgeElementRepository = require('./knowledge-element-repository');
const CampaignAssessmentParticipationSummary = require('../../domain/read-models/CampaignAssessmentParticipationSummary');

const campaignAssessmentParticipationRepository = {

  async findPaginatedByCampaignId({ page = {}, campaignId, filters = {} }) {
    const targetProfile = await targetProfileRepository.getByCampaignId(campaignId);
    const targetedSkillIds = targetProfile.skills.map(({ id }) => id);
    const query = knex.with('campaign_participation_summaries',
      (qb) => {
        _campaignParticipationByParticipantSortedByDate(qb, campaignId, filters);
      })
      .distinct('campaignParticipationId')
      .select('*')
      .from('campaign_participation_summaries')
      .modify(_filterByBadgeAcquisitionsOut, filters)
      .orderByRaw('?? ASC, ?? ASC', ['lowerLastName', 'lowerFirstName']);

    const { results, pagination } = await fetchPage(query, page);

    const campaignAssessmentParticipationSummaries = await _buildCampaignAssessmentParticipationSummaries(results, targetedSkillIds);

    return {
      campaignAssessmentParticipationSummaries,
      pagination,
    };
  },
};

function _campaignParticipationByParticipantSortedByDate(qb, campaignId, filters) {
  qb.select(knex.raw('"campaign-participations"."id" AS "campaignParticipationId"'), knex.raw('"users"."id" AS "userId"'))
    .select(
      knex.raw('COALESCE (LOWER("schooling-registrations"."firstName"), LOWER("users"."firstName")) AS "lowerFirstName"'),
      knex.raw('COALESCE (LOWER("schooling-registrations"."lastName"), LOWER("users"."lastName")) AS "lowerLastName"'),
      knex.raw('COALESCE ("schooling-registrations"."firstName", "users"."firstName") AS "firstName"'),
      knex.raw('COALESCE ("schooling-registrations"."lastName", "users"."lastName") AS "lastName"'),
      'campaign-participations.participantExternalId',
      'campaign-participations.sharedAt',
      'campaign-participations.isShared',
      'assessments.state',
    )
    .from('campaign-participations')
    .join('assessments', 'assessments.campaignParticipationId', 'campaign-participations.id')
    .join('users', 'users.id', 'campaign-participations.userId')
    .join('campaigns', 'campaigns.id', 'campaign-participations.campaignId')
    .leftJoin('schooling-registrations', function() {
      this.on({ 'campaign-participations.userId': 'schooling-registrations.userId' })
        .andOn({ 'campaigns.organizationId': 'schooling-registrations.organizationId' });
    })
    .where('campaign-participations.campaignId', '=', campaignId)
    .modify(_filterMostRecentAssessments)
    .modify(_filterByDivisions, filters)
    .modify(_filterByBadgeAcquisitionsIn, filters);
}

async function _buildCampaignAssessmentParticipationSummaries(results, targetedSkillIds) {
  const _getValidatedSkillCountInTargetProfile = await _makeMemoizedGetValidatedSkillCountInTargetProfile(results, targetedSkillIds);

  return results.map((result) => new CampaignAssessmentParticipationSummary({
    ...result,
    targetedSkillCount: targetedSkillIds.length,
    validatedTargetedSkillCount: _getValidatedSkillCountInTargetProfile(result.userId),
  }));
}

async function _makeMemoizedGetValidatedSkillCountInTargetProfile(results, targetedSkillIds) {
  const sharedResults = results
    .filter((result) => result.isShared);

  const sharedResultsChunks = await bluebird.mapSeries(
    _.chunk(sharedResults, constants.CHUNK_SIZE_CAMPAIGN_RESULT_PROCESSING),
    (sharedResultsChunk) => {
      const sharedAtDatesByUsers = Object.fromEntries(sharedResultsChunk.map(({ userId, sharedAt }) => [userId, sharedAt]));

      return _getValidatedTargetSkillIds(
        sharedAtDatesByUsers,
        targetedSkillIds,
      );
    });

  let validatedTargetedSkillIdsByUser = {};
  for (const sharedResultsChunk of sharedResultsChunks) {
    validatedTargetedSkillIdsByUser = { ...validatedTargetedSkillIdsByUser, ...sharedResultsChunk };
  }

  return (userId) => {
    return validatedTargetedSkillIdsByUser[userId] ? validatedTargetedSkillIdsByUser[userId].length : 0;
  };
}

async function _getValidatedTargetSkillIds(sharedAtDatesByUsers, targetedSkillIds) {
  const knowledgeElementsByUser = await knowledgeElementRepository.findSnapshotForUsers(sharedAtDatesByUsers);

  for (const userId of Object.keys(knowledgeElementsByUser)) {
    const validatedKnowledgeElements = _.filter(knowledgeElementsByUser[userId], 'isValidated');
    const validatedSkillIds = _.map(validatedKnowledgeElements, 'skillId');
    knowledgeElementsByUser[userId] = _.intersection(validatedSkillIds, targetedSkillIds);
  }

  return knowledgeElementsByUser;
}

function _filterMostRecentAssessments(qb) {
  qb
    .leftJoin({ 'newerAssessments': 'assessments' }, function() {
      this.on('newerAssessments.campaignParticipationId', 'campaign-participations.id')
        .andOn('assessments.createdAt', '<', knex.ref('newerAssessments.createdAt'));
    })
    .whereNull('newerAssessments.id');
}

function _filterByDivisions(qb, filters) {
  if (filters.divisions) {
    const divisionsLowerCase = filters.divisions.map((division) => division.toLowerCase());
    qb.whereRaw('LOWER("schooling-registrations"."division") = ANY(:divisionsLowerCase)', { divisionsLowerCase });
  }
}

function _filterByBadgeAcquisitionsIn(qb, filters) {
  if (filters.badges) {
    qb.select(
      knex.raw('ARRAY_AGG("badgeId") OVER (PARTITION BY "campaign-participations"."id") as badges_acquired'),
    )
      .join('badges', 'badges.targetProfileId', 'campaigns.targetProfileId')
      .join('badge-acquisitions', function() {
        this.on({ 'badge-acquisitions.badgeId': 'badges.id' })
          .andOn({ 'badge-acquisitions.userId': 'campaign-participations.userId' });
      })
      .where('campaign-participations.isShared', '=', true);
  }
}

function _filterByBadgeAcquisitionsOut(qb, filters) {
  if (filters.badges) {
    qb.whereRaw(':badgeIds <@ "badges_acquired"', { badgeIds: filters.badges });
  }
}

module.exports = campaignAssessmentParticipationRepository;
