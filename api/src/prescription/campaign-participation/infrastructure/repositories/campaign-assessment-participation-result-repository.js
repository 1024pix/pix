import { DomainTransaction } from '../../../../shared/domain/DomainTransaction.js';
import { NotFoundError } from '../../../../shared/domain/errors.js';
import * as knowledgeStateSnapshotRepository from '../../../campaign/infrastructure/repositories/knowledge-state-snapshot-repository.js';
import * as learningContentRepository from '../../../shared/infrastructure/repositories/learning-content-repository.js';
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
  const knexConn = DomainTransaction.getConnection();

  const [campaignAssessmentParticipationResult] = await knexConn
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
  const snapshots = await knowledgeStateSnapshotRepository.findByCampaignParticipationIds([
    result.campaignParticipationId,
  ]);
  const knowledgeState = snapshots[result.campaignParticipationId];
  const validatedSkillIds = knowledgeState ? knowledgeState.validatedSkills().map(({ id }) => id) : [];
  const validatedTargetedSkillsCountByCompetenceId =
    campaignLearningContent.countTargetedSkillsByCompetence(validatedSkillIds);

  return new CampaignAssessmentParticipationResult({
    ...result,
    campaignLearningContent,
    validatedTargetedSkillsCountByCompetenceId,
  });
}
