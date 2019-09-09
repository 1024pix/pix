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
    answers,
    knowledgeElements,
    [
      targetSkills,
      challenges,
    ],
  ] = await Promise.all([
    answerRepository.findByAssessment(assessment.id),
    _fetchKnowledgeElementsForCampaign({ assessment, knowledgeElementRepository, improvementService }),
    _fetchSkillsAndChallenges({ targetProfileId, targetProfileRepository, challengeRepository })
  ]);

  return {
    answers,
    targetSkills,
    challenges,
    knowledgeElements,
  };
}

async function _fetchKnowledgeElementsForCampaign({
  assessment,
  knowledgeElementRepository,
  improvementService,
}) {
  const knowledgeElements = await knowledgeElementRepository.findUniqByUserId({ userId: assessment.userId });
  return improvementService.filterKnowledgeElementsToRemoveThoseWhichCanBeImproved({ knowledgeElements, assessment });
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
}) {

  const [
    answers,
    targetSkills,
    challenges,
    knowledgeElements

  ] = await Promise.all([
    answerRepository.findByAssessment(assessment.id),
    skillRepository.findByCompetenceId(assessment.competenceId),
    challengeRepository.findByCompetenceId(assessment.competenceId),
    knowledgeElementRepository.findUniqByUserId({ userId: assessment.userId })]
  );

  return {
    answers,
    targetSkills,
    challenges,
    knowledgeElements,
  };
}

module.exports = {
  fetchForCampaigns,
  fetchForCompetenceEvaluations,
};
