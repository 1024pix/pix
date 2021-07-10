const Question = require('./../models/Question');
module.exports = function getNextQuestionForCertification({
  certificationChallengeRepository,
  challengeRepository,
  assessment,
}) {

  return certificationChallengeRepository.getNextNonAnsweredChallengeWithIndexByCourseId(assessment.id, assessment.certificationCourseId)
    .then(async (certificationChallengeWithIndex) => {
      const challenge = await challengeRepository.get(certificationChallengeWithIndex.challenge.challengeId);
      return new Question({ index: certificationChallengeWithIndex.index, challenge });
    });
};
