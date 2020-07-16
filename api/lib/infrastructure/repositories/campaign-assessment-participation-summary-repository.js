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

    const rowCount = _getRowCount(results);

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

function _getRowCount(results) {
  const firstRow = results[0];
  return firstRow ? firstRow.rowCount : 0;
}

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

async function _buildCampaignAssessmentParticipationSummaries(results, targetedSkillIds) {
  const _getValidatedSkillCountInTargetProfil = await _makeMemoizedGetValidatedSkillCountInTargetProfil(results, targetedSkillIds);

  return results.map((result) => new CampaignAssessmentParticipationSummary({
    ...result,
    targetedSkillCount: targetedSkillIds.length,
    validatedTargetedSkillCount: _getValidatedSkillCountInTargetProfil(result.userId),
  }));
}

async function _makeMemoizedGetValidatedSkillCountInTargetProfil(results, targetedSkillIds) {
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

module.exports = campaignAssessmentParticipationRepository;
