import * as injectedCampaignRepository from '../../../prescription/campaign/infrastructure/repositories/campaign-repository.js';
import * as injectedCampaignParticipationRepository from '../../../prescription/campaign-participation/infrastructure/repositories/campaign-participation-repository.js';
import * as injectedAssessmentRepository from '../../../shared/infrastructure/repositories/assessment-repository.js';
import * as injectedSkillRepository from '../../../shared/infrastructure/repositories/skill-repository.js';
import * as injectedCompetenceEvaluationRepository from '../../infrastructure/repositories/competence-evaluation-repository.js';
import { Progression } from '../models/Progression.js';
import * as injectedImprovementService from '../services/improvement-service.js';

const getProgression = async function ({
  progressionId,
  userId,
  assessmentRepository = injectedAssessmentRepository,
  competenceEvaluationRepository = injectedCompetenceEvaluationRepository,
  campaignParticipationRepository = injectedCampaignParticipationRepository,
  knowledgeElementRepository,
  skillRepository = injectedSkillRepository,
  campaignRepository = injectedCampaignRepository,
  improvementService = injectedImprovementService,
} = {}) {
  const assessmentId = Progression.getAssessmentIdFromId(progressionId);

  const assessment = await assessmentRepository.getByAssessmentIdAndUserId(assessmentId, userId);
  let progression;

  if (assessment.isForCampaign()) {
    const campaignParticipation = await campaignParticipationRepository.get(assessment.campaignParticipationId);

    const skillIds = await campaignRepository.findSkillIds({ campaignId: campaignParticipation.campaignId });
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
