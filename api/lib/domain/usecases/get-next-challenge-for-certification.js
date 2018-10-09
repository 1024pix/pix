module.exports = function getNextChallengeForCertification({
  certificationChallengeRepository,
  challengeRepository,
  assessment,
}) {

  return certificationChallengeRepository.getNonAnsweredChallengeByCourseId(assessment.id, assessment.courseId)
    .then((certificationChallenge) => {
      return challengeRepository.get(certificationChallenge.challengeId);
    });
};
