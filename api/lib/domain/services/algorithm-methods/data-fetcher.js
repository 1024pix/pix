const _ = require('lodash');

async function fetchForCampaigns({
  assessment,
  answerRepository,
  targetProfileRepository,
  challengeRepository,
  knowledgeElementRepository,
  campaignParticipationRepository,
  improvementService,
}) {
  const targetProfile = await targetProfileRepository.getByCampaignParticipationId(assessment.campaignParticipationId);
  const isRetrying = await campaignParticipationRepository.isRetrying({
    campaignParticipationId: assessment.campaignParticipationId,
  });

  const [allAnswers, knowledgeElements, [targetSkills, challenges]] = await Promise.all([
    answerRepository.findByAssessment(assessment.id),
    _fetchKnowledgeElements({
      assessment,
      isRetrying,
      campaignParticipationRepository,
      knowledgeElementRepository,
      improvementService,
    }),
    _fetchSkillsAndChallenges({ targetProfile, challengeRepository }),
  ]);

  return {
    allAnswers,
    lastAnswer: _.isEmpty(allAnswers) ? null : _.last(allAnswers),
    targetSkills,
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
  const knowledgeElements = await knowledgeElementRepository.findUniqByUserId({ userId: assessment.userId });
  return improvementService.filterKnowledgeElementsIfImproving({ knowledgeElements, assessment, isRetrying });
}

async function _fetchSkillsAndChallenges({ targetProfile, challengeRepository }) {
  const challenges = await challengeRepository.findOperativeBySkills(targetProfile.skills);
  return [targetProfile.skills, challenges];
}

async function fetchForCompetenceEvaluations({
  assessment,
  answerRepository,
  challengeRepository,
  knowledgeElementRepository,
  skillRepository,
  improvementService,
}) {
  const [allAnswers, targetSkills, challenges, knowledgeElements] = await Promise.all([
    answerRepository.findByAssessment(assessment.id),
    skillRepository.findActiveByCompetenceId(assessment.competenceId),
    challengeRepository.findValidatedByCompetenceId(assessment.competenceId),
    _fetchKnowledgeElements({ assessment, knowledgeElementRepository, improvementService }),
  ]);

  return {
    allAnswers,
    lastAnswer: _.isEmpty(allAnswers) ? null : _.last(allAnswers),
    targetSkills,
    challenges,
    knowledgeElements,
  };
}

async function fetchForFlashCampaigns({ assessment, answerRepository, challengeRepository, locale }) {
  const [allAnswers, challenges] = await Promise.all([
    answerRepository.findByAssessment(assessment.id),
    challengeRepository.findFlashCompatible(locale),
  ]);

  return {
    allAnswers,
    challenges,
  };
}

async function fetchForFlashLevelEstimation({ assessment, answerRepository, challengeRepository }) {
  const allAnswers = await answerRepository.findByAssessment(assessment.id);
  // FIXME might need optimization, add a getMany on challengeRepository?
  const challenges = await Promise.all(allAnswers.map(({ challengeId }) => challengeRepository.get(challengeId)));

  return {
    allAnswers,
    challenges,
  };
}

module.exports = {
  fetchForCampaigns,
  fetchForCompetenceEvaluations,
  fetchForFlashCampaigns,
  fetchForFlashLevelEstimation,
};
