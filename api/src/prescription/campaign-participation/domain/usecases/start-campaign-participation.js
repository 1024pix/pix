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
  domainTransaction,
}) {
  const campaignParticipant = await campaignParticipantRepository.get({
    userId,
    campaignId: campaignParticipation.campaignId,
    domainTransaction,
  });

  campaignParticipant.start({
    participantExternalId: campaignParticipation.participantExternalId,
    isReset: campaignParticipation.isReset,
  });

  const campaignParticipationId = await campaignParticipantRepository.save({ campaignParticipant, domainTransaction });

  const createdCampaignParticipation = await campaignParticipationRepository.get(
    campaignParticipationId,
    domainTransaction,
  );

  const areKnowledgeElementsResettable = await campaignRepository.areKnowledgeElementsResettable({
    id: campaignParticipation.campaignId,
    domainTransaction,
  });

  if (areKnowledgeElementsResettable && campaignParticipation.isReset) {
    await _resetCampaignParticipation({
      campaignParticipation,
      userId,
      assessmentRepository,
      campaignRepository,
      competenceEvaluationRepository,
      knowledgeElementRepository,
      domainTransaction,
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
  domainTransaction,
}) {
  const skills = await campaignRepository.findAllSkills({
    campaignId: campaignParticipation.campaignId,
    domainTransaction,
  });
  const skillIds = skills.map(({ id }) => id);
  const competenceIds = skills.map(({ competenceId }) => competenceId);

  const knowledgeElements = await knowledgeElementRepository.findUniqByUserId({ userId, domainTransaction });

  const resetKes = knowledgeElements.filter((ke) => skillIds.includes(ke.skillId)).map(KnowledgeElement.reset);

  await knowledgeElementRepository.batchSave({ knowledgeElements: resetKes, domainTransaction });
  const competenceEvaluations = await competenceEvaluationRepository.findByUserId(userId);
  if (!competenceEvaluations) {
    return;
  }

  const assessmentIds = competenceEvaluations
    .filter((competenceEvaluation) => competenceIds.includes(competenceEvaluation.competenceId))
    .map(({ assessmentId }) => assessmentId);
  await assessmentRepository.setAssessmentsAsStarted({ assessmentIds, domainTransaction });
}

export { startCampaignParticipation };
