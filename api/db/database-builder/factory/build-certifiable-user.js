import { buildUser } from './build-user.js';
import { buildAssessment } from './build-assessment.js';
import { buildAnswer } from './build-answer.js';
import { buildKnowledgeElement } from './build-knowledge-element.js';

const buildCertifiableUser = function ({ competencesAssociatedSkillsAndChallenges, limitDate }) {
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
};

export { buildCertifiableUser };
