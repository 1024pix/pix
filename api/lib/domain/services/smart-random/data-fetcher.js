async function fetchForCampaigns({
  assessment,
  answerRepository,
  targetProfileRepository,
  challengeRepository,
  knowledgeElementRepository,
}) {
  const [
    answers,
    targetSkills,
    challenges,
    knowledgeElements,

  ] = await Promise.all([
    answerRepository.findByAssessment(assessment.id),
    ...(await targetProfileRepository.get(assessment.campaignParticipation.getTargetProfileId())
      .then((targetProfile) => Promise.all([targetProfile.skills, challengeRepository.findBySkills(targetProfile.skills)]))),
    knowledgeElementRepository.findUniqByUserId({ userId: assessment.userId }),
  ]);

  return {
    answers,
    targetSkills,
    challenges,
    knowledgeElements,
  };
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
