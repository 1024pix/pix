import { ForbiddenAccess } from '../../../shared/domain/errors.js';
import { Progression } from '../models/Progression.js';

const getProgression = async function ({
  progressionId,
  userId,
  getCampaignProgression,
  assessmentRepository,
  competenceEvaluationRepository,
  knowledgeStateRepository,
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
    const knowledgeState = await knowledgeStateRepository.findByUserId({ userId });

    const knowledgeStateForProgression = improvementService.improveKnowledgeState({
      knowledgeState,
      isImproving: assessment.isImproving,
      createdAt: assessment.createdAt,
    });

    progression = new Progression({
      id: progressionId,
      skillIds: skills?.map((skill) => skill.id) ?? [],
      knowledgeState: knowledgeStateForProgression,
      isProfileCompleted: assessment.isCompleted(),
    });
  }

  return progression;
};

export { getProgression };
