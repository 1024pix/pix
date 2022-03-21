const _ = require('lodash');
const { NotFoundError } = require('../../../lib/domain/errors');
const CampaignAssessmentParticipation = require('../../../lib/domain/read-models/CampaignAssessmentParticipation');
const { knex } = require('../../../db/knex-database-connection');
const knowledgeElementRepository = require('./knowledge-element-repository');
const targetProfileRepository = require('./target-profile-repository');

const Assessment = require('../../../lib/domain/models/Assessment');

module.exports = {
  async getByCampaignIdAndCampaignParticipationId({ campaignId, campaignParticipationId }) {
    const result = await _fetchCampaignAssessmentAttributesFromCampaignParticipation(
      campaignId,
      campaignParticipationId
    );

    return _buildCampaignAssessmentParticipation(result);
  },
};

async function _fetchCampaignAssessmentAttributesFromCampaignParticipation(campaignId, campaignParticipationId) {
  const [campaignAssessmentParticipation] = await knex
    .with('campaignAssessmentParticipation', (qb) => {
      qb.select([
        'campaign-participations.userId',
        'organization-learners.firstName',
        'organization-learners.lastName',
        'campaign-participations.id AS campaignParticipationId',
        'campaign-participations.campaignId',
        'campaign-participations.createdAt',
        'campaign-participations.sharedAt',
        'campaign-participations.status',
        'campaign-participations.participantExternalId',
        'campaign-participations.masteryRate',
        'assessments.state AS assessmentState',
        _assessmentRankByCreationDate(),
      ])
        .from('campaign-participations')
        .join('assessments', 'assessments.campaignParticipationId', 'campaign-participations.id')
        .join('organization-learners', 'organization-learners.id', 'campaign-participations.organizationLearnerId')
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
  return knex.raw('ROW_NUMBER() OVER (PARTITION BY ?? ORDER BY ?? DESC) AS rank', [
    'assessments.campaignParticipationId',
    'assessments.createdAt',
  ]);
}

async function _buildCampaignAssessmentParticipation(result) {
  const { targetedSkillsCount, testedSkillsCount } = await _setSkillsCount(result);

  return new CampaignAssessmentParticipation({
    ...result,
    targetedSkillsCount,
    testedSkillsCount,
  });
}

async function _setSkillsCount(result) {
  let targetedSkillsCount = 0;
  let testedSkillsCount = 0;

  if (result.assessmentState !== Assessment.states.COMPLETED) {
    const targetProfile = await targetProfileRepository.getByCampaignId(result.campaignId);
    const targetedSkillIds = targetProfile.skills.map(({ id }) => id);

    const knowledgeElementsByUser = await knowledgeElementRepository.findSnapshotForUsers({
      [result.userId]: result.sharedAt,
    });
    const knowledgeElements = knowledgeElementsByUser[result.userId];

    targetedSkillsCount = targetedSkillIds.length;
    testedSkillsCount = _getTestedSkillsCountInTargetProfile(result, targetedSkillIds, knowledgeElements);
  }

  return { targetedSkillsCount, testedSkillsCount };
}

function _getTestedSkillsCountInTargetProfile(result, targetedSkillIds, knowledgeElements) {
  const testedKnowledgeElements = _.filter(
    knowledgeElements,
    (knowledgeElement) => knowledgeElement.isValidated || knowledgeElement.isInvalidated
  );
  const testedSkillIds = _.map(testedKnowledgeElements, 'skillId');
  const testedTargetedSkillIdsByUser = _.intersection(testedSkillIds, targetedSkillIds);

  return testedTargetedSkillIdsByUser.length;
}
