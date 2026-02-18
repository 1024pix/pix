import { ForbiddenAccess } from '../../../shared/domain/errors.js';
import { Progression } from '../models/Progression.js';

const getProgression = async function ({
  progressionId,
  userId,
  assessmentRepository,
  competenceEvaluationRepository,
  campaignParticipationRepository,
  knowledgeElementRepository,
  knowledgeElementForParticipationService,
  skillRepository,
  campaignRepository,
  improvementService,
}) {
  const assessmentId = Progression.getAssessmentIdFromId(progressionId);

  const assessment = await assessmentRepository.getByAssessmentIdAndUserId(assessmentId, userId);
  let progression;

  if (assessment.isForCampaign()) {
    if (!assessment.campaignParticipationId) throw new ForbiddenAccess('Campaign does not accept any answer.');

    const campaignParticipation = await campaignParticipationRepository.get(assessment.campaignParticipationId);

    const skillIds = await campaignRepository.findSkillIds({ campaignId: campaignParticipation.campaignId });

    const knowledgeElementsBeforeSharedDate =
      await knowledgeElementForParticipationService.findUniqByUserOrCampaignParticipationId({
        userId,
        campaignParticipationId: campaignParticipation.id,
        limitDate: campaignParticipation.sharedAt,
      });

    const isRetrying = await campaignParticipationRepository.isRetrying({
      campaignParticipationId: assessment.campaignParticipationId,
    });

    const knowledgeElementsForProgression = improvementService.filterKnowledgeElements({
      knowledgeElements: knowledgeElementsBeforeSharedDate,
      createdAt: assessment.createdAt,
      isRetrying,
      isFromCampaign: true,
      isImproving: true,
    });

    progression = new Progression({
      id: progressionId,
      skillIds,
      knowledgeElements: knowledgeElementsForProgression,
      isProfileCompleted: assessment.isCompleted(),
    });
  }

  if (assessment.isCompetenceEvaluation()) {
    const competenceEvaluation = await competenceEvaluationRepository.getByAssessmentId(assessmentId);
    const skills = await skillRepository.findActiveByCompetenceId(competenceEvaluation.competenceId);
    const knowledgeElements = await knowledgeElementRepository.findUniqByUserId({ userId });

    const knowledgeElementsForProgression = improvementService.filterKnowledgeElements({
      knowledgeElements,
      isImproving: assessment.isImproving,
      createdAt: assessment.createdAt,
    });

    progression = new Progression({
      id: progressionId,
      skillIds: skills?.map((skill) => skill.id) ?? [],
      knowledgeElements: knowledgeElementsForProgression,
      isProfileCompleted: assessment.isCompleted(),
    });
  }

  return progression;
};

export { getProgression };
