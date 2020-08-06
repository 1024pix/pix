const _ = require('lodash');
const bluebird = require('bluebird');
const { knex } = require('../bookshelf');
const constants = require('../constants');
const targetProfileRepository = require('./target-profile-repository');
const knowledgeElementRepository = require('./knowledge-element-repository');
const CampaignAssessmentParticipationSummary = require('../../domain/read-models/CampaignAssessmentParticipationSummary');

const DEFAULT_PAGE_SIZE = 10;
const DEFAULT_PAGE_NUMBER = 1;

const campaignAssessmentParticipationRepository = {

  async findPaginatedByCampaignId({ page = {}, campaignId }) {
    const pageSize = page.size ? page.size : DEFAULT_PAGE_SIZE;
    const pageNumber = page.number ? page.number : DEFAULT_PAGE_NUMBER;
    const offset = (pageNumber - 1) * pageSize;

    const targetProfile = await targetProfileRepository.getByCampaignId(campaignId);
    const targetedSkillIds = targetProfile.skills.map(({ id }) => id);
    const results = await knex.with('campaign_participation_summaries',
      (qb) => {
        _campaignParticipationByParticipantSortedByDate(qb, campaignId);
      })
      .select('*')
      .select(knex.raw('COUNT(*) OVER() AS ??', ['rowCount']))
      .from('campaign_participation_summaries')
      .where({ rank: 1 })
      .orderByRaw('LOWER(??) ASC, LOWER(??) ASC', ['lastName', 'firstName'])
      .limit(pageSize).offset(offset);

    let rowCount = 0;
    if (results[0]) {
      rowCount = results[0].rowCount;
    }
    const campaignAssessmentParticipationSummaries = await _buildCampaignAssessmentParticipationSummaries(results, targetedSkillIds);

    return {
      campaignAssessmentParticipationSummaries,
      pagination: {
        page: pageNumber,
        pageSize,
        rowCount,
        pageCount: Math.ceil(rowCount / pageSize),
      },
    };
  }
};

function _campaignParticipationByParticipantSortedByDate(qb, campaignId) {
  qb.select(knex.raw('"campaign-participations"."id" AS "campaignParticipationId"'), knex.raw('"users"."id" AS "userId"'))
    .select('users.firstName', 'users.lastName', 'campaign-participations.participantExternalId', 'campaign-participations.sharedAt',
      'campaign-participations.isShared', 'assessments.state',
      knex.raw('ROW_NUMBER() OVER (PARTITION BY ?? ORDER BY ?? DESC) AS rank', ['assessments.campaignParticipationId', 'assessments.createdAt']))
    .from('campaign-participations')
    .join('assessments', 'assessments.campaignParticipationId', 'campaign-participations.id')
    .join('users', 'users.id', 'campaign-participations.userId')
    .join('campaigns', 'campaigns.id', 'campaign-participations.campaignId')
    .where('campaign-participations.campaignId', '=', campaignId);
}

async function _buildCampaignAssessmentParticipationSummaries(resultSet, targetedSkillIds) {
  const chunks = _.chunk(resultSet, constants.CHUNK_SIZE_CAMPAIGN_RESULT_PROCESSING);
  const notFlat = await bluebird.mapSeries(
    chunks,
    (chunk) => _buildCampaignAssessmentParticipationSummary(chunk, targetedSkillIds),
  );

  return notFlat.flat();
}

async function _buildCampaignAssessmentParticipationSummary(results, targetedSkillIds) {
  const sharedResults = results
    .filter((result) => result.isShared);

  const userIdsAndDates = Object.fromEntries(sharedResults.map((result) => {
    return [
      result.userId,
      result.sharedAt,
    ];
  }));

  const validatedTargetedSkillIdsByUser = await _getValidatedTargetSkillIds(
    userIdsAndDates,
    targetedSkillIds,
  );

  return results.map((result) => {
    const validatedTargetedSkillCount = validatedTargetedSkillIdsByUser[result.userId] ? validatedTargetedSkillIdsByUser[result.userId].length : 0;
    return new CampaignAssessmentParticipationSummary({
      ...result,
      targetedSkillCount: targetedSkillIds.length,
      validatedTargetedSkillCount,
    });
  });
}

async function _getValidatedTargetSkillIds(userIdsAndDates, targetedSkillIds) {
  const knowledgeElementsByUser = await knowledgeElementRepository.findSnapshotForUsers(userIdsAndDates);

  for (const userId of Object.keys(knowledgeElementsByUser)) {
    const validatedKnowledgeElements = _.filter(knowledgeElementsByUser[userId], 'isValidated');
    const validatedSkillIds = _.map(validatedKnowledgeElements, 'skillId');
    knowledgeElementsByUser[userId] = _.intersection(validatedSkillIds, targetedSkillIds);
  }

  return knowledgeElementsByUser;
}

module.exports = campaignAssessmentParticipationRepository;
