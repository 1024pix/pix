import CampaignAssessmentParticipationResult from '../../../lib/domain/read-models/CampaignAssessmentParticipationResult';
import { NotFoundError } from '../../../lib/domain/errors';
import { knex } from '../../../db/knex-database-connection';
import knowledgeElementRepository from './knowledge-element-repository';
import learningContentRepository from './learning-content-repository';
import CampaignLearningContent from '../../domain/models/CampaignLearningContent';

export default {
  async getByCampaignIdAndCampaignParticipationId({ campaignId, campaignParticipationId, locale }) {
    const learningContent = await learningContentRepository.findByCampaignId(campaignId, locale);
    const campaignLearningContent = new CampaignLearningContent(learningContent);
    const result = await _fetchCampaignAssessmentParticipationResultAttributesFromCampaignParticipation(
      campaignId,
      campaignParticipationId
    );

    return _buildCampaignAssessmentParticipationResults(result, campaignLearningContent);
  },
};

async function _fetchCampaignAssessmentParticipationResultAttributesFromCampaignParticipation(
  campaignId,
  campaignParticipationId
) {
  const [campaignAssessmentParticipationResult] = await knex
    .with('campaignAssessmentParticipationResult', (qb) => {
      qb.select([
        'users.id AS userId',
        'campaign-participations.id AS campaignParticipationId',
        'campaign-participations.campaignId',
        'campaign-participations.sharedAt',
        'campaign-participations.status',
      ])
        .from('campaign-participations')
        .join('assessments', 'assessments.campaignParticipationId', 'campaign-participations.id')
        .join('users', 'users.id', 'campaign-participations.userId')
        .leftJoin('campaigns', 'campaign-participations.campaignId', 'campaigns.id')
        .where({
          campaignId,
          'campaign-participations.id': campaignParticipationId,
          'campaign-participations.deletedAt': null,
        });
    })
    .from('campaignAssessmentParticipationResult');

  if (campaignAssessmentParticipationResult == null) {
    throw new NotFoundError(`There is no campaign participation with the id "${campaignParticipationId}"`);
  }

  return campaignAssessmentParticipationResult;
}

async function _buildCampaignAssessmentParticipationResults(result, campaignLearningContent) {
  const validatedTargetedKnowledgeElementsCountByCompetenceId =
    await knowledgeElementRepository.countValidatedByCompetencesForOneUserWithinCampaign(
      result.userId,
      result.sharedAt,
      campaignLearningContent
    );

  return new CampaignAssessmentParticipationResult({
    ...result,
    campaignLearningContent,
    validatedTargetedKnowledgeElementsCountByCompetenceId,
  });
}
