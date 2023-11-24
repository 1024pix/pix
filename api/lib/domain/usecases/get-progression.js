import { Progression } from '../../../src/evaluation/domain/models/Progression.js';

const getProgression = async function ({
  progressionId,
  userId,
  assessmentRepository,
  competenceEvaluationRepository,
  campaignParticipationRepository,
  knowledgeElementRepository,
  skillRepository,
  campaignRepository,
  improvementService,
}) {
  const assessmentId = Progression.getAssessmentIdFromId(progressionId);

  const assessment = await assessmentRepository.getByAssessmentIdAndUserId(assessmentId, userId);
  let progression;

  if (assessment.isForCampaign()) {
    const campaignParticipation = await campaignParticipationRepository.get(assessment.campaignParticipationId);
    let skillIds;
    if (!assessment.isFlash()) {
      skillIds = await campaignRepository.findSkillIds({ campaignId: campaignParticipation.campaignId });
    }
    const knowledgeElementsBeforeSharedDate = await knowledgeElementRepository.findUniqByUserId({
      userId,
      limitDate: campaignParticipation.sharedAt,
    });
    const isRetrying = await campaignParticipationRepository.isRetrying({
      campaignParticipationId: assessment.campaignParticipationId,
    });

    const knowledgeElementsForProgression = await improvementService.filterKnowledgeElementsIfImproving({
      knowledgeElements: knowledgeElementsBeforeSharedDate,
      assessment,
      isRetrying,
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
    const [skills, knowledgeElements] = await Promise.all([
      skillRepository.findActiveByCompetenceId(competenceEvaluation.competenceId),
      knowledgeElementRepository.findUniqByUserId({ userId }),
    ]);
    const knowledgeElementsForProgression = await improvementService.filterKnowledgeElementsIfImproving({
      knowledgeElements,
      assessment,
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
