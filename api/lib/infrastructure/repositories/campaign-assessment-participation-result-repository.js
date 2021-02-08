const CampaignAssessmentParticipationResult = require('../../../lib/domain/read-models/CampaignAssessmentParticipationResult');
const { NotFoundError } = require('../../../lib/domain/errors');
const { knex } = require('../bookshelf');
const knowledgeElementRepository = require('./knowledge-element-repository');
const targetProfileWithLearningContentRepository = require('./target-profile-with-learning-content-repository');

module.exports = {
  async getByCampaignIdAndCampaignParticipationId({ campaignId, campaignParticipationId, locale }) {
    const targetProfileWithLearningContent = await targetProfileWithLearningContentRepository.getByCampaignId({ campaignId, locale });

    const result = await _fetchCampaignAssessmentParticipationResultAttributesFromCampaignParticipation(campaignId, campaignParticipationId);

    return _buildCampaignAssessmentParticipationResults(result, targetProfileWithLearningContent);
  },
};

async function _fetchCampaignAssessmentParticipationResultAttributesFromCampaignParticipation(campaignId, campaignParticipationId) {

  const [campaignAssessmentParticipationResult] = await knex.with('campaignAssessmentParticipationResult',
    (qb) => {
      qb.select([
        'users.id AS userId',
        'campaign-participations.id AS campaignParticipationId',
        'campaign-participations.campaignId',
        'campaign-participations.sharedAt',
        'campaign-participations.isShared',
      ])
        .from('campaign-participations')
        .join('assessments', 'assessments.campaignParticipationId', 'campaign-participations.id')
        .join('users', 'users.id', 'campaign-participations.userId')
        .leftJoin('campaigns', 'campaign-participations.campaignId', 'campaigns.id')
        .where({
          campaignId,
          'campaign-participations.id': campaignParticipationId,
        });
    })
    .from('campaignAssessmentParticipationResult');

  if (campaignAssessmentParticipationResult == null) {
    throw new NotFoundError(`There is no campaign participation with the id "${campaignParticipationId}"`);
  }

  return campaignAssessmentParticipationResult;
}

async function _buildCampaignAssessmentParticipationResults(result, targetProfileWithLearningContent) {
  const validatedTargetedKnowledgeElementsCountByCompetenceId = await knowledgeElementRepository
    .countValidatedTargetedByCompetencesForOneUser(result.userId, result.sharedAt, targetProfileWithLearningContent);

  return new CampaignAssessmentParticipationResult({
    ...result,
    targetedCompetences: targetProfileWithLearningContent.competences,
    validatedTargetedKnowledgeElementsCountByCompetenceId,
    targetProfile: targetProfileWithLearningContent,
  });
}
