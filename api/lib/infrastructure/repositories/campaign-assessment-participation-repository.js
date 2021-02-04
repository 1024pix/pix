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
  const knowledgeElementsByUser = await knowledgeElementRepository.findSnapshotForUsers({ [result.userId]: result.sharedAt });
  const knowledgeElements = knowledgeElementsByUser[result.userId];
  const testedSkillsCount = _getTestedSkillsCountInTargetProfile(result, targetedSkillIds, knowledgeElements);
  return new CampaignAssessmentParticipation({
    ...result,
    targetedSkillsCount: targetedSkillIds.length,
    validatedSkillsCount: _getValidatedSkillsCountInTargetProfile(result, targetedSkillIds, knowledgeElements),
    testedSkillsCount,
  });
}

function _getValidatedSkillsCountInTargetProfile(result, targetedSkillIds, knowledgeElements) {
  const validatedKnowledgeElements = _.filter(knowledgeElements, 'isValidated');
  const validatedSkillIds = _.map(validatedKnowledgeElements, 'skillId');
  const validatedTargetedSkillIds = _.intersection(validatedSkillIds, targetedSkillIds);

  return validatedTargetedSkillIds.length;
}

function _getTestedSkillsCountInTargetProfile(result, targetedSkillIds, knowledgeElements) {
  const testedKnowledgeElements = _.filter(knowledgeElements, (knowledgeElement) => knowledgeElement.isValidated || knowledgeElement.isInvalidated);
  const testedSkillIds = _.map(testedKnowledgeElements, 'skillId');
  const testedTargetedSkillIdsByUser = _.intersection(testedSkillIds, targetedSkillIds);

  return testedTargetedSkillIdsByUser.length;
}
