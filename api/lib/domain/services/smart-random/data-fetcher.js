function fetchForCampaigns({
  assessment,
  answerRepository,
  targetProfileRepository,
  challengeRepository,
  knowledgeElementRepository,
}) {
  return Promise.all([
    answerRepository.findByAssessment(assessment.id),
    targetProfileRepository.get(assessment.campaignParticipation.getTargetProfileId())
      .then((targetProfile) => Promise.all([targetProfile, challengeRepository.findBySkills(targetProfile.skills)])),
    knowledgeElementRepository.findUniqByUserId({ userId: assessment.userId }),
  ]);
}

function fetchForCompetenceEvaluations({ assessment, competenceEvaluation, answerRepository, challengeRepository, knowledgeElementRepository, skillRepository }) {
  return Promise.all([
    answerRepository.findByAssessment(assessment.id),
    skillRepository.findByCompetenceId(competenceEvaluation.competenceId),
    challengeRepository.findByCompetenceId(competenceEvaluation.competenceId),
    knowledgeElementRepository.findUniqByUserId({ userId: assessment.userId })]
  );
}

module.exports = {
  fetchForCampaigns,
  fetchForCompetenceEvaluations,
};
