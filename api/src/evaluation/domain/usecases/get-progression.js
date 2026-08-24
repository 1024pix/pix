import { ForbiddenAccess } from '../../../shared/domain/errors.js';
import { Progression } from '../models/Progression.js';

const getProgression = async function ({
  progressionId,
  userId,
  getCampaignProgression,
  assessmentRepository,
  competenceEvaluationRepository,
  knowledgeElementRepository,
  skillRepository,
  improvementService,
}) {
  const assessmentId = Progression.getAssessmentIdFromId(progressionId);

  const assessment = await assessmentRepository.getByAssessmentIdAndUserId(assessmentId, userId);
  let progression;

  if (assessment.isForCampaign()) {
    if (!assessment.campaignParticipationId) throw new ForbiddenAccess('Campaign does not accept any answer.');

    progression = await getCampaignProgression({ assessment, progressionId });
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
