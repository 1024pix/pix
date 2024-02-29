const getNextChallengeForV2Certification = async function ({
  assessment,
  certificationChallengeRepository,
  challengeRepository,
}) {
  return certificationChallengeRepository
    .getNextNonAnsweredChallengeByCourseId(assessment.id, assessment.certificationCourseId)
    .then((certificationChallenge) => {
      return challengeRepository.get(certificationChallenge.challengeId);
    });
};

export { getNextChallengeForV2Certification };
