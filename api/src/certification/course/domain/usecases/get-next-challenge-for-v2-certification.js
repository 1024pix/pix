const getNextChallengeForV2Certification = async function ({
  assessment,
  certificationChallengeRepository,
  challengeRepository,
}) {
  const certificationChallenge = await certificationChallengeRepository.getNextNonAnsweredChallengeByCourseId(
    assessment.id,
    assessment.certificationCourseId,
  );
  return challengeRepository.get(certificationChallenge.challengeId);
};

export { getNextChallengeForV2Certification };
