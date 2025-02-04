import { knex } from '../../../../../db/knex-database-connection.js';
import * as learningContentRepository from '../../../../../lib/infrastructure/repositories/learning-content-repository.js';
import { NotFoundError } from '../../../../shared/domain/errors.js';
import * as knowledgeElementRepository from '../../../../shared/infrastructure/repositories/knowledge-element-repository.js';
import { CampaignAssessmentParticipationResult } from '../../domain/models/CampaignAssessmentParticipationResult.js';

const getByCampaignIdAndCampaignParticipationId = async function ({ campaignId, campaignParticipationId, locale }) {
  const campaignLearningContent = await learningContentRepository.findByCampaignId(campaignId, locale);
  const result = await _fetchCampaignAssessmentParticipationResultAttributesFromCampaignParticipation(
    campaignId,
    campaignParticipationId,
  );

  return _buildCampaignAssessmentParticipationResults(result, campaignLearningContent);
};

export { getByCampaignIdAndCampaignParticipationId };

async function _fetchCampaignAssessmentParticipationResultAttributesFromCampaignParticipation(
  campaignId,
  campaignParticipationId,
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
  const knowledgeElementsGroupedByUser = await knowledgeElementRepository.findAssessedByUserIdAndLimitDateQuery({
    userId: result.userId,
    limitDate: result.sharedAt,
  });
  const knowledgeElements = Object.values(knowledgeElementsGroupedByUser).flat();
  const validatedTargetedKnowledgeElementsCountByCompetenceId =
    campaignLearningContent.countValidatedTargetedKnowledgeElementsByCompetence(knowledgeElements);

  return new CampaignAssessmentParticipationResult({
    ...result,
    campaignLearningContent,
    validatedTargetedKnowledgeElementsCountByCompetenceId,
  });
}
