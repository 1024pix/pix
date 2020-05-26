const buildUser = require('./build-user');
const buildAssessment = require('./build-assessment');
const buildAnswer = require('./build-answer');
const buildKnowledgeElement = require('./build-knowledge-element');

module.exports = function buildCertifiableUser({
  competencesAssociatedSkillsAndChallenges,
}) {
  const certifiableUser = buildUser();
  const assessmentId = buildAssessment({ userId: certifiableUser.id }).id;
  const commonUserIdAssessmentIdAndEarnedPixForAllKEs = { userId: certifiableUser.id, assessmentId, earnedPix: 4 };
  competencesAssociatedSkillsAndChallenges.forEach((element) => {
    const { challengeId, competenceId } = element;
    const answerId = buildAnswer({ assessmentId, challengeId }).id;
    buildKnowledgeElement({ ...commonUserIdAssessmentIdAndEarnedPixForAllKEs, competenceId, answerId });
  });

  return certifiableUser;
};
