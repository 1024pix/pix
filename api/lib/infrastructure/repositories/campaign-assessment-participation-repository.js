const _ = require('lodash');
const { NotFoundError } = require('../../../lib/domain/errors.js');
const CampaignAssessmentParticipation = require('../../../lib/domain/read-models/CampaignAssessmentParticipation.js');
const { knex } = require('../../../db/knex-database-connection.js');
const knowledgeElementRepository = require('./knowledge-element-repository.js');
const campaignRepository = require('./campaign-repository.js');

const Assessment = require('../../../lib/domain/models/Assessment.js');

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
        'organization-learners.id AS organizationLearnerId',
        'assessments.state AS assessmentState',
        _assessmentRankByCreationDate(),
      ])
        .from('campaign-participations')
        .join('assessments', 'assessments.campaignParticipationId', 'campaign-participations.id')
        .join('organization-learners', 'organization-learners.id', 'campaign-participations.organizationLearnerId')
        .where({
          'campaign-participations.id': campaignParticipationId,
          'campaign-participations.deletedAt': null,
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
    const operativeSkillIds = await campaignRepository.findSkillIds({ campaignId: result.campaignId });

    const knowledgeElementsByUser = await knowledgeElementRepository.findSnapshotForUsers({
      [result.userId]: result.sharedAt,
    });
    const knowledgeElements = knowledgeElementsByUser[result.userId];

    targetedSkillsCount = operativeSkillIds.length;
    testedSkillsCount = _getTestedSkillsCount(operativeSkillIds, knowledgeElements);
  }

  return { targetedSkillsCount, testedSkillsCount };
}

function _getTestedSkillsCount(skillIds, knowledgeElements) {
  const testedKnowledgeElements = _.filter(
    knowledgeElements,
    (knowledgeElement) => knowledgeElement.isValidated || knowledgeElement.isInvalidated
  );
  const testedSkillIds = _.map(testedKnowledgeElements, 'skillId');
  const testedTargetedSkillIdsByUser = _.intersection(testedSkillIds, skillIds);

  return testedTargetedSkillIdsByUser.length;
}
