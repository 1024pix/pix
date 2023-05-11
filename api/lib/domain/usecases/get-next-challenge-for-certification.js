const getNextChallengeForCertification = function ({
  certificationChallengeRepository,
  challengeRepository,
  assessment,
}) {
  return certificationChallengeRepository
    .getNextNonAnsweredChallengeByCourseId(assessment.id, assessment.certificationCourseId)
    .then((certificationChallenge) => {
      return challengeRepository.get(certificationChallenge.challengeId);
    });
};

export { getNextChallengeForCertification };
