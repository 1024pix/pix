import { Assessment } from '../../../../shared/domain/models/Assessment.js';
import { fallbackChallengeLocales } from '../../../../shared/domain/services/locale-service.js';

export async function fetchForCampaigns({
  assessment,
  answerRepository,
  campaignRepository,
  smartRandomChallengeRepository,
  knowledgeStateForParticipationService,
  knowledgeStateRepository,
  campaignParticipationRepository,
  improvementService,
  locale,
}) {
  const campaignSkills = await campaignRepository.findSkillsByCampaignParticipationId({
    campaignParticipationId: assessment.campaignParticipationId,
  });
  const isRetrying = await campaignParticipationRepository.isRetrying({
    campaignParticipationId: assessment.campaignParticipationId,
  });

  const allAnswers = await answerRepository.findByAssessment(assessment.id);
  const knowledgeState = await _fetchKnowledgeState({
    assessment,
    isRetrying,
    isFromCampaign: true,
    isImproving: true,
    knowledgeStateForParticipationService,
    knowledgeStateRepository,
    improvementService,
  });
  const [skills, challenges] = await _fetchSkillsAndChallenges({
    campaignSkills,
    smartRandomChallengeRepository,
    locale,
  });

  return {
    allAnswers,
    lastAnswer: allAnswers?.at(-1) ?? null,
    targetSkills: skills,
    challenges,
    knowledgeState,
  };
}

async function _fetchKnowledgeState({
  assessment,
  isRetrying = false,
  isFromCampaign = false,
  isImproving = false,
  knowledgeStateForParticipationService,
  knowledgeStateRepository,
  improvementService,
}) {
  let knowledgeState;
  if (assessment.type === Assessment.types.CAMPAIGN) {
    knowledgeState = await knowledgeStateForParticipationService.findByUserOrCampaignParticipationId({
      userId: assessment.userId,
      campaignParticipationId: assessment.campaignParticipationId,
    });
  } else {
    knowledgeState = await knowledgeStateRepository.findByUserId({
      userId: assessment.userId,
    });
  }

  return improvementService.improveKnowledgeState({
    knowledgeState,
    isFromCampaign,
    isRetrying,
    isImproving: isImproving || assessment.isImproving,
    createdAt: assessment.createdAt,
  });
}

export async function _fetchSkillsAndChallenges({ campaignSkills, smartRandomChallengeRepository, locale }) {
  const locales = fallbackChallengeLocales(locale);
  const challenges = await smartRandomChallengeRepository.findOperativeBySkillsAndLocales(campaignSkills, locales);
  return [campaignSkills, challenges];
}

export async function fetchForCompetenceEvaluations({
  assessment,
  answerRepository,
  smartRandomChallengeRepository,
  knowledgeStateRepository,
  skillRepository,
  improvementService,
  locale,
}) {
  const allAnswers = await answerRepository.findByAssessment(assessment.id);
  const targetSkills = await skillRepository.findActiveByCompetenceId(assessment.competenceId);
  const challenges = await smartRandomChallengeRepository.findValidatedByCompetenceId(assessment.competenceId, locale);
  const knowledgeState = await _fetchKnowledgeState({
    assessment,
    knowledgeStateRepository,
    improvementService,
  });

  return {
    allAnswers,
    lastAnswer: allAnswers?.at(-1) ?? null,
    targetSkills,
    challenges,
    knowledgeState,
  };
}
