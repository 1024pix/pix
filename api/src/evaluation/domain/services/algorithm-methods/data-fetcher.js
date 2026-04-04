import { Assessment } from '../../../../shared/domain/models/Assessment.js';
import { fallbackChallengeLocales } from '../../../../shared/domain/services/locale-service.js';

export async function fetchForCampaigns({
  assessment,
  answerRepository,
  campaignRepository,
  smartRandomChallengeRepository,
  knowledgeElementForParticipationService,
  knowledgeElementRepository,
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
  const knowledgeElements = await _fetchKnowledgeElements({
    assessment,
    isRetrying,
    isFromCampaign: true,
    isImproving: true,
    knowledgeElementForParticipationService,
    knowledgeElementRepository,
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
    knowledgeElements,
  };
}

async function _fetchKnowledgeElements({
  assessment,
  isRetrying = false,
  isFromCampaign = false,
  isImproving = false,
  knowledgeElementForParticipationService,
  knowledgeElementRepository,
  improvementService,
}) {
  let knowledgeElements;
  if (assessment.type === Assessment.types.CAMPAIGN) {
    knowledgeElements = await knowledgeElementForParticipationService.findUniqByUserOrCampaignParticipationId({
      userId: assessment.userId,
      campaignParticipationId: assessment.campaignParticipationId,
    });
  } else {
    knowledgeElements = await knowledgeElementRepository.findUniqByUserId({
      userId: assessment.userId,
    });
  }

  return improvementService.filterKnowledgeElements({
    knowledgeElements,
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
  knowledgeElementRepository,
  skillRepository,
  improvementService,
  locale,
}) {
  const allAnswers = await answerRepository.findByAssessment(assessment.id);
  const targetSkills = await skillRepository.findActiveByCompetenceId(assessment.competenceId);
  const challenges = await smartRandomChallengeRepository.findValidatedByCompetenceId(assessment.competenceId, locale);
  const knowledgeElements = await _fetchKnowledgeElements({
    assessment,
    knowledgeElementRepository,
    improvementService,
  });

  return {
    allAnswers,
    lastAnswer: allAnswers?.at(-1) ?? null,
    targetSkills,
    challenges,
    knowledgeElements,
  };
}
