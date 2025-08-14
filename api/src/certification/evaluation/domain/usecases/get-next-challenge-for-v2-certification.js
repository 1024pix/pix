import { certificationChallengeRepository as injectedSessionManagementCertificationChallengeRepository } from '../../../session-management/infrastructure/repositories/index.js';
import { challengeRepository as injectedSharedChallengeRepository } from '../../../session-management/infrastructure/repositories/index.js'; /**
 * @typedef {import('../../../session-management/domain/usecases/index.js').SessionManagementCertificationChallengeRepository} SessionManagementCertificationChallengeRepository
 * @typedef {import('../../../session-management/domain/usecases/index.js').ChallengeRepository} ChallengeRepository
 */

/**
 * @param {Object} params
 * @param {Object} params.assessment
 * @param {SessionManagementCertificationChallengeRepository} params.sessionManagementCertificationChallengeRepository
 * @param {ChallengeRepository} params.challengeRepository
 */
const getNextChallengeForV2Certification = async function ({
  assessment,
  sessionManagementCertificationChallengeRepository = injectedSessionManagementCertificationChallengeRepository,
  sharedChallengeRepository = injectedSharedChallengeRepository,
} = {}) {
  const certificationChallenge =
    await sessionManagementCertificationChallengeRepository.getNextNonAnsweredChallengeByCourseId(
      assessment.id,
      assessment.certificationCourseId,
    );
  return sharedChallengeRepository.get(certificationChallenge.challengeId);
};

export { getNextChallengeForV2Certification };
