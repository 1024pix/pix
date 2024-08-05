/**
 * @typedef {import('./index.js').CertificationChallengeRepository} CertificationChallengeRepository
 * @typedef {import('./index.js').ChallengeRepository} ChallengeRepository
 */

/**
 * @param {Object} params
 * @param {Object} params.assessment
 * @param {CertificationChallengeRepository} params.certificationChallengeRepository
 * @param {ChallengeRepository} params.challengeRepository
 */
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
