async function fetchForCampaigns({
  assessment,
  answerRepository,
  targetProfileRepository,
  challengeRepository,
  knowledgeElementRepository,
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
    knowledgeElementRepository.findUniqByUserId({ userId: assessment.userId }),
    _fetchSkillsAndChallenges({ targetProfileId, targetProfileRepository, challengeRepository })
  ]);

  return {
    answers,
    targetSkills,
    challenges,
    knowledgeElements,
  };
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
  competenceEvaluationRepository,
  skillRepository,
}) {
  const {
    competenceId
  } = await competenceEvaluationRepository.getByAssessmentId(assessment.id);

  const [
    answers,
    targetSkills,
    challenges,
    knowledgeElements

  ] = await Promise.all([
    answerRepository.findByAssessment(assessment.id),
    skillRepository.findByCompetenceId(competenceId),
    challengeRepository.findByCompetenceId(competenceId),
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
