import * as injectedCompetenceEvaluationRepository from '../../../../evaluation/infrastructure/repositories/competence-evaluation-repository.js';
import { KnowledgeElement } from '../../../../shared/domain/models/KnowledgeElement.js';
import * as injectedAssessmentRepository from '../../../../shared/infrastructure/repositories/assessment-repository.js';
import * as injectedCampaignRepository from '../../../campaign/infrastructure/repositories/campaign-repository.js';
import * as injectedCampaignParticipationRepository from '../../infrastructure/repositories/campaign-participation-repository.js';
import { participationStartedJobRepository as injectedParticipationStartedJobRepository } from '../../infrastructure/repositories/jobs/participation-started-job-repository.js';
import { ParticipationStartedJob } from '../models/ParticipationStartedJob.js';

export async function startCampaignParticipation({
  campaignParticipation,
  userId,
  campaignRepository = injectedCampaignRepository,
  assessmentRepository = injectedAssessmentRepository,
  knowledgeElementRepository,
  campaignParticipantRepository,
  campaignParticipationRepository = injectedCampaignParticipationRepository,
  competenceEvaluationRepository = injectedCompetenceEvaluationRepository,
  participationStartedJobRepository = injectedParticipationStartedJobRepository,
} = {}) {
  const campaignParticipant = await campaignParticipantRepository.get({
    userId,
    campaignId: campaignParticipation.campaignId,
  });

  campaignParticipant.start({
    participantExternalId: campaignParticipation.participantExternalId,
    isReset: campaignParticipation.isReset,
  });

  const campaignParticipationId = await campaignParticipantRepository.save({ campaignParticipant });

  const createdCampaignParticipation = await campaignParticipationRepository.get(campaignParticipationId);

  const areKnowledgeElementsResettable = await campaignRepository.areKnowledgeElementsResettable({
    id: campaignParticipation.campaignId,
  });

  if (areKnowledgeElementsResettable && campaignParticipation.isReset) {
    await _resetCampaignParticipation({
      campaignParticipation,
      userId,
      assessmentRepository,
      campaignRepository,
      competenceEvaluationRepository,
      knowledgeElementRepository,
    });
  }

  await participationStartedJobRepository.performAsync(new ParticipationStartedJob({ campaignParticipationId }));
  return {
    campaignParticipation: createdCampaignParticipation,
  };
}

async function _resetCampaignParticipation({
  campaignParticipation,
  userId,
  assessmentRepository,
  campaignRepository,
  competenceEvaluationRepository,
  knowledgeElementRepository,
}) {
  const skills = await campaignRepository.findAllSkills({
    campaignId: campaignParticipation.campaignId,
  });
  const skillIds = skills.map(({ id }) => id);
  const competenceIds = skills.map(({ competenceId }) => competenceId);

  const knowledgeElements = await knowledgeElementRepository.findUniqByUserId({ userId });

  const resetKes = knowledgeElements.filter((ke) => skillIds.includes(ke.skillId)).map(KnowledgeElement.reset);

  await knowledgeElementRepository.batchSave({ knowledgeElements: resetKes });
  const competenceEvaluations = await competenceEvaluationRepository.findByUserId(userId);
  if (!competenceEvaluations) {
    return;
  }

  const assessmentIds = competenceEvaluations
    .filter((competenceEvaluation) => competenceIds.includes(competenceEvaluation.competenceId))
    .map(({ assessmentId }) => assessmentId);
  await assessmentRepository.setAssessmentsAsStarted({ assessmentIds });
}
