const buildCertificationCourse = require('./build-certification-course');
const buildAssessment = require('./build-assessment');
const Assessment = require('../../../../lib/domain/models/Assessment');
const buildCertificationChallenge = require('./build-certification-challenge');
const buildAnswer = require('./build-answer');

module.exports = function buildAnsweredNotCompletedCertificationAssessment({
  certifiableUserId,
  competencesAssociatedSkillsAndChallenges,
}) {
  const certificationCourseId = buildCertificationCourse({ userId: certifiableUserId }).id;
  const certificationAssessment = buildAssessment({ certificationCourseId, userId: certifiableUserId, state: Assessment.states.STARTED, type: Assessment.types.CERTIFICATION });
  competencesAssociatedSkillsAndChallenges.forEach((element) => {
    const { challengeId, competenceId } = element;
    buildCertificationChallenge({ courseId: certificationCourseId, challengeId, competenceId });
    buildAnswer({ assessmentId: certificationAssessment.id, challengeId, result: 'ok' });
  });

  return certificationAssessment;
};
