import _ from 'lodash';

import { Assessment } from '../../../../shared/domain/models/index.js';
import { ChallengeForSmartRandom } from '../../models/ChallengeForSmartRandom.js';

async function fetchForCampaigns({
  assessment,
  answerRepository,
  campaignRepository,
  challengesAPI,
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

  const [allAnswers, knowledgeElements, [skills, challenges]] = await Promise.all([
    answerRepository.findByAssessment(assessment.id),
    _fetchKnowledgeElements({
      assessment,
      isRetrying,
      campaignParticipationRepository,
      knowledgeElementRepository,
      improvementService,
    }),
    _fetchSkillsAndChallenges({ challengesAPI, campaignSkills, locale }),
  ]);

  return {
    allAnswers,
    lastAnswer: _.isEmpty(allAnswers) ? null : _.last(allAnswers),
    targetSkills: skills,
    challenges,
    knowledgeElements,
  };
}

async function _fetchKnowledgeElements({
  assessment,
  isRetrying = false,
  knowledgeElementRepository,
  improvementService,
}) {
  let knowledgeElements;
  if (assessment.type === Assessment.types.CAMPAIGN) {
    knowledgeElements = await knowledgeElementRepository.findUniqByUserIdForCampaignParticipation({
      userId: assessment.userId,
      campaignParticipationId: assessment.campaignParticipationId,
    });
  } else {
    knowledgeElements = await knowledgeElementRepository.findUniqByUserId({ userId: assessment.userId });
  }
  return improvementService.filterKnowledgeElementsIfImproving({ knowledgeElements, assessment, isRetrying });
}

async function _fetchSkillsAndChallenges({ challengesAPI, campaignSkills, locale }) {
  const challengeDtos = await challengesAPI.findOperativeBySkills(campaignSkills, locale);
  const challenges = challengeDtos.map(ChallengeForSmartRandom.fromLearningContentApiDto);
  return [campaignSkills, challenges];
}

async function fetchForCompetenceEvaluations({
  assessment,
  answerRepository,
  challengesAPI,
  knowledgeElementRepository,
  skillRepository,
  improvementService,
  locale,
}) {
  const [allAnswers, targetSkills, challengeDtos, knowledgeElements] = await Promise.all([
    answerRepository.findByAssessment(assessment.id),
    skillRepository.findActiveByCompetenceId(assessment.competenceId),
    challengesAPI.findValidatedByCompetenceId(assessment.competenceId, locale),
    _fetchKnowledgeElements({ assessment, knowledgeElementRepository, improvementService }),
  ]);

  return {
    allAnswers,
    lastAnswer: _.isEmpty(allAnswers) ? null : _.last(allAnswers),
    targetSkills,
    challenges: challengeDtos.map(ChallengeForSmartRandom.fromLearningContentApiDto),
    knowledgeElements,
  };
}

export { fetchForCampaigns, fetchForCompetenceEvaluations };
