const _ = require('lodash');
const { knex } = require('../bookshelf');
const CampaignAssessmentParticipationSummary = require('../../domain/read-models/CampaignAssessmentParticipationSummary');
const targetProfileRepository = require('./target-profile-repository');
const knowledgeElementRepository = require('./knowledge-element-repository');
const bluebird = require('bluebird');
const constants = require('../constants');

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

function _buildCampaignAssessmentParticipationSummaries(resultSet, targetedSkillIds) {
  return bluebird.map(
    resultSet,
    (result) => _buildCampaignAssessmentParticipationSummary(result, targetedSkillIds),
    { concurrency: constants.CONCURRENCY_HEAVY_OPERATIONS }
  );
}

async function _buildCampaignAssessmentParticipationSummary(result, targetedSkillIds) {

  let validatedTargetedSkillIds = [];
  if (result.isShared) {
    validatedTargetedSkillIds = await _getValidatedTargetSkillIds(result.userId, result.sharedAt, targetedSkillIds);
  }

  return new CampaignAssessmentParticipationSummary({
    ...result,
    targetedSkillCount: targetedSkillIds.length,
    validatedTargetedSkillCount: validatedTargetedSkillIds.length,
  });
}

async function _getValidatedTargetSkillIds(userId, limitDate, targetedSkillIds) {
  const knowledgeElements = await knowledgeElementRepository.findUniqByUserId({
    userId,
    limitDate,
  });

  const validatedKnowledgeElements = _.filter(knowledgeElements, 'isValidated');
  const validatedSkillIds = _.map(validatedKnowledgeElements, 'skillId');
  return _.intersection(validatedSkillIds, targetedSkillIds);
}

module.exports = campaignAssessmentParticipationRepository;
