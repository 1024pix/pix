const CampaignAssessmentParticipationResult = require('../../../lib/domain/read-models/CampaignAssessmentParticipationResult');
const { NotFoundError } = require('../../../lib/domain/errors');
const { knex } = require('../bookshelf');
const knowledgeElementRepository = require('./knowledge-element-repository');
const targetProfileWithLearningContentRepository = require('./target-profile-with-learning-content-repository');

module.exports = {
  async getByCampaignIdAndCampaignParticipationId({ campaignId, campaignParticipationId }) {
    const targetProfile = await targetProfileWithLearningContentRepository.getByCampaignId({ campaignId });

    const result = await _fetchCampaignAssessmentParticipationResultAttributesFromCampaignParticipation(campaignId, campaignParticipationId);

    return _buildCampaignAssessmentParticipationResults(result, targetProfile);
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

async function _buildCampaignAssessmentParticipationResults(result, targetProfile) {
  const validatedTargetedKnowledgeElementsCountByCompetenceId = await knowledgeElementRepository
    .countValidatedTargetedByCompetencesForUser(result.userId ,result.sharedAt , targetProfile);

  return new CampaignAssessmentParticipationResult({
    ...result,
    targetedCompetences: targetProfile.competences,
    validatedTargetedKnowledgeElementsCountByCompetenceId,
    targetProfile,
  });
}
