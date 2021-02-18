const _ = require('lodash');
const { NotFoundError } = require('../../../lib/domain/errors');
const CampaignAssessmentParticipation = require('../../../lib/domain/read-models/CampaignAssessmentParticipation');
const { knex } = require('../bookshelf');
const knowledgeElementRepository = require('./knowledge-element-repository');
const targetProfileRepository = require('./target-profile-repository');

module.exports = {
  async getByCampaignIdAndCampaignParticipationId({ campaignId, campaignParticipationId }) {
    const targetProfile = await targetProfileRepository.getByCampaignId(campaignId);
    const targetedSkillIds = targetProfile.skills.map(({ id }) => id);

    const result = await _fetchCampaignAssessmentAttributesFromCampaignParticipation(campaignId, campaignParticipationId);

    return _buildCampaignAssessmentParticipation(result, targetedSkillIds);
  },
};

async function _fetchCampaignAssessmentAttributesFromCampaignParticipation(campaignId, campaignParticipationId) {

  const [campaignAssessmentParticipation] = await knex.with('campaignAssessmentParticipation',
    (qb) => {
      qb.select([
        'users.id AS userId',
        knex.raw('COALESCE ("schooling-registrations"."firstName", "users"."firstName") AS "firstName"'),
        knex.raw('COALESCE ("schooling-registrations"."lastName", "users"."lastName") AS "lastName"'),
        'campaign-participations.id AS campaignParticipationId',
        'campaign-participations.campaignId',
        'campaign-participations.createdAt',
        'campaign-participations.sharedAt',
        'campaign-participations.isShared',
        'campaign-participations.participantExternalId',
        'assessments.state AS assessmentState',
        _assessmentRankByCreationDate(),
      ])
        .from('campaign-participations')
        .join('assessments', 'assessments.campaignParticipationId', 'campaign-participations.id')
        .join('users', 'users.id', 'campaign-participations.userId')
        .join('campaigns', 'campaigns.id', 'campaign-participations.campaignId')
        .leftJoin('schooling-registrations', function() {
          this.on('campaign-participations.userId', 'schooling-registrations.userId')
            .andOn('campaigns.organizationId', 'schooling-registrations.organizationId');
        })
        .where({
          'campaign-participations.id': campaignParticipationId,
        });
    })
    .from('campaignAssessmentParticipation')
    .where({ rank: 1 });

  if (campaignAssessmentParticipation == null) {
    throw new NotFoundError(`There is no campaign participation with the id "${campaignParticipationId}"`);
  }

  return campaignAssessmentParticipation;
}

function _assessmentRankByCreationDate() {
  return knex.raw('ROW_NUMBER() OVER (PARTITION BY ?? ORDER BY ?? DESC) AS rank', ['assessments.campaignParticipationId', 'assessments.createdAt']);
}

async function _buildCampaignAssessmentParticipation(result, targetedSkillIds) {
  const testedSkillsCount = await _getTestedSkillsCountInTargetProfile(result, targetedSkillIds);
  return new CampaignAssessmentParticipation({
    ...result,
    targetedSkillsCount: targetedSkillIds.length,
    validatedSkillsCount: await _getValidatedSkillsCountInTargetProfile(result, targetedSkillIds),
    testedSkillsCount,
  });
}

async function _getValidatedSkillsCountInTargetProfile(result, targetedSkillIds) {
  const validatedTargetedSkillIdsByUser = await _getValidatedTargetSkillIds(
    { [result.userId]: result.sharedAt },
    targetedSkillIds,
  );

  return _.get(validatedTargetedSkillIdsByUser, `${result.userId}.length`, 0);
}

async function _getTestedSkillsCountInTargetProfile(result, targetedSkillIds) {
  const testedTargetedSkillIdsByUser = await _getTestedTargetSkillIds(
    { [result.userId]: result.sharedAt },
    targetedSkillIds,
  );

  return _.get(testedTargetedSkillIdsByUser, `${result.userId}.length`, 0);
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

async function _getTestedTargetSkillIds(sharedAtDatesByUsers, targetedSkillIds) {
  const knowledgeElementsByUser = await knowledgeElementRepository.findSnapshotForUsers(sharedAtDatesByUsers);

  for (const userId of Object.keys(knowledgeElementsByUser)) {
    const testedKnowledgeElements = _.filter(knowledgeElementsByUser[userId], (knowledgeElement) => knowledgeElement.isValidated || knowledgeElement.isInvalidated);
    const testedSkillIds = _.map(testedKnowledgeElements, 'skillId');
    knowledgeElementsByUser[userId] = _.intersection(testedSkillIds, targetedSkillIds);
  }

  return knowledgeElementsByUser;
}
