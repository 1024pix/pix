import { DomainTransaction } from '../../../../shared/domain/DomainTransaction.js';
import { ParticipationStartedJob } from '../models/ParticipationStartedJob.js';

export const startCampaignParticipation = async ({
  campaignParticipation,
  userId,
  campaignRepository,
  assessmentRepository,
  knowledgeStateRepository,
  campaignParticipantRepository,
  campaignParticipationRepository,
  competenceEvaluationRepository,
  participationStartedJobRepository,
}) => {
  const campaignParticipant = await campaignParticipantRepository.get({
    userId,
    campaignId: campaignParticipation.campaignId,
  });

  campaignParticipant.start({
    participantExternalId: campaignParticipation.participantExternalId,
    isReset: campaignParticipation.isReset,
  });

  const createdCampaignParticipation = await DomainTransaction.execute(async () => {
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
        knowledgeStateRepository,
      });
    }
    return createdCampaignParticipation;
  });

  await participationStartedJobRepository.performAsync(
    new ParticipationStartedJob({ campaignParticipationId: createdCampaignParticipation.id }),
  );
  return {
    campaignParticipation: createdCampaignParticipation,
  };
};

async function _resetCampaignParticipation({
  campaignParticipation,
  userId,
  assessmentRepository,
  campaignRepository,
  competenceEvaluationRepository,
  knowledgeStateRepository,
}) {
  const skills = await campaignRepository.findAllSkills({
    campaignId: campaignParticipation.campaignId,
  });
  const skillIds = skills.map(({ id }) => id);
  const competenceIds = skills.map(({ competenceId }) => competenceId);

  const knowledgeState = await knowledgeStateRepository.findByUserId({ userId });

  // Remettre à zéro efface l'état des compétences touchées par la campagne,
  // sans trace : rien ne peut le reconstituer, et c'est le contrat.
  const assessedCompetenceIds = new Set(
    knowledgeState
      .assessedSkills()
      .filter(({ id }) => skillIds.includes(id))
      .map(({ competenceId }) => competenceId),
  );
  for (const competenceId of assessedCompetenceIds) {
    await knowledgeStateRepository.forgetCompetence({ userId, competenceId });
  }
  const competenceEvaluations = await competenceEvaluationRepository.findByUserId(userId);
  if (!competenceEvaluations) {
    return;
  }

  const assessmentIds = competenceEvaluations
    .filter((competenceEvaluation) => competenceIds.includes(competenceEvaluation.competenceId))
    .map(({ assessmentId }) => assessmentId);
  await assessmentRepository.setAssessmentsAsStarted({ assessmentIds });
}
