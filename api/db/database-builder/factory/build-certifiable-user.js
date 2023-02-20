import buildUser from './build-user';
import buildAssessment from './build-assessment';
import buildAnswer from './build-answer';
import buildKnowledgeElement from './build-knowledge-element';

export default function buildCertifiableUser({ competencesAssociatedSkillsAndChallenges, limitDate }) {
  const certifiableUser = buildUser();
  const assessmentId = buildAssessment({ userId: certifiableUser.id }).id;
  const commonUserIdAssessmentIdAndEarnedPixForAllKEs = { userId: certifiableUser.id, assessmentId, earnedPix: 4 };
  competencesAssociatedSkillsAndChallenges.forEach((element) => {
    const { challengeId, competenceId } = element;
    const answerId = buildAnswer({ assessmentId, challengeId }).id;
    buildKnowledgeElement({
      ...commonUserIdAssessmentIdAndEarnedPixForAllKEs,
      competenceId,
      answerId,
      createdAt: limitDate,
    });
  });

  return certifiableUser;
}
