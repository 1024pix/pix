
const logger = require('../../infrastructure/logger');

module.exports = function({ certificationChallengeRepository, challengeRepository, assessment }) {

  const logContext = {
    zone: 'usecase.getNextChallengeForCertification',
    type: 'usecase',
    assessment,
    assessmentId: assessment.id,
  };
  logger.trace(logContext, 'looking for next challenge in CERTIFICATION assessment');

  return certificationChallengeRepository.getNonAnsweredChallengeByCourseId(assessment.id, assessment.courseId)
    .then((certificationChallenge) => {
      logContext.certificationChallenge = certificationChallenge;
      logger.trace(logContext, 'found next challenge');

      return challengeRepository.get(certificationChallenge.challengeId);
    });

};
