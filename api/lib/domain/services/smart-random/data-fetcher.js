const _ = require('lodash');

async function fetchForCampaigns({
  assessment,
  answerRepository,
  targetProfileRepository,
  challengeRepository,
  knowledgeElementRepository,
  improvementService,
}) {
  const targetProfileId = assessment.campaignParticipation.getTargetProfileId();

  const [
    allAnswers,
    knowledgeElements,
    [
      targetSkills,
      challenges,
    ],
  ] = await Promise.all([
    answerRepository.findByAssessment(assessment.id),
    _fetchKnowledgeElements({ assessment, knowledgeElementRepository, improvementService }),
    _fetchSkillsAndChallenges({ targetProfileId, targetProfileRepository, challengeRepository })
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
  knowledgeElementRepository,
  improvementService,
}) {
  const knowledgeElements = await knowledgeElementRepository.findUniqByUserId({ userId: assessment.userId });
  return improvementService.filterKnowledgeElementsIfImproving({ knowledgeElements, assessment });
}

async function _fetchSkillsAndChallenges({
  targetProfileId,
  targetProfileRepository,
  challengeRepository,
}) {
  const targetProfile = await targetProfileRepository.get(targetProfileId);
  const challenges = await challengeRepository.findBySkills(targetProfile.skills);
  return [ targetProfile.skills, challenges ];
}

async function fetchForCompetenceEvaluations({
  assessment,
  answerRepository,
  challengeRepository,
  knowledgeElementRepository,
  skillRepository,
  improvementService,
}) {

  const [
    allAnswers,
    targetSkills,
    challenges,
    knowledgeElements
  ] = await Promise.all([
    answerRepository.findByAssessment(assessment.id),
    skillRepository.findByCompetenceId(assessment.competenceId),
    challengeRepository.findByCompetenceId(assessment.competenceId),
    _fetchKnowledgeElements({ assessment, knowledgeElementRepository, improvementService })
  ]);

  return {
    allAnswers,
    lastAnswer: _.isEmpty(allAnswers) ? null : _.last(allAnswers),
    targetSkills,
    challenges,
    knowledgeElements,
  };
}

module.exports = {
  fetchForCampaigns,
  fetchForCompetenceEvaluations,
};
