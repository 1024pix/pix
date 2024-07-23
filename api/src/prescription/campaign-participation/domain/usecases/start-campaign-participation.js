import { CampaignParticipationStarted } from '../../../../../lib/domain/events/CampaignParticipationStarted.js';
import { KnowledgeElement } from '../../../../../lib/domain/models/KnowledgeElement.js';

const startCampaignParticipation = async function ({
  campaignParticipation,
  userId,
  campaignRepository,
  assessmentRepository,
  knowledgeElementRepository,
  campaignParticipantRepository,
  campaignParticipationRepository,
  competenceEvaluationRepository,
}) {
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

  return {
    event: new CampaignParticipationStarted({ campaignParticipationId }),
    campaignParticipation: createdCampaignParticipation,
  };
};

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

export { startCampaignParticipation };
