/**
 * @typedef {import ('../../domain/events/ChallengeDeneutralized.js').ChallengeDeneutralized} ChallengeDeneutralized
 * @typedef {import ('../../domain/events/ChallengeNeutralized.js').ChallengeNeutralized} ChallengeNeutralized
 * @typedef {import ('../../domain/events/CertificationJuryDone.js').CertificationJuryDone} CertificationJuryDone
 * @typedef {import ('../../domain/events/CertificationCourseRejected.js').CertificationCourseRejected} CertificationCourseRejected
 * @typedef {import ('../../domain/events/CertificationCourseUnrejected.js').CertificationCourseUnrejected} CertificationCourseUnrejected
 * @typedef {import ('../../domain/events/CertificationCancelled.js').CertificationCancelled} CertificationCancelled
 * @typedef {import ('../../domain/events/CertificationRescored.js').CertificationRescored} CertificationRescored
 * @typedef {import ('../../domain/events/CertificationUncancelled.js').CertificationUncancelled} CertificationUncancelled
 * @typedef {import ('../../../../shared/domain/errors.js').AssessmentEndedError} AssessmentEndedError
 * @typedef {import ('../../../../shared/domain/errors.js').AssessmentLackOfChallengesError} AssessmentLackOfChallengesError
 */
import { withTransaction } from '../../../../shared/domain/DomainTransaction.js';
import { usecases } from '../../domain/usecases/index.js';
import * as assessmentRepository from '../../infrastructure/repositories/assessment-repository.js';

/**
 * @function
 * @name rescoreV3Certification
 *
 * @param {object} params
 * @param {CertificationJuryDone|CertificationCourseRejected|CertificationCourseUnrejected|CertificationCancelled|CertificationRescored|CertificationUncancelled} params.event
 *
 * @returns {Promise<void>}
 */
export const rescoreV3Certification = async ({ event }) => {
  return usecases.scoreV3Certification({ certificationCourseId: event.certificationCourseId, event });
};
/**
 * @function
 * @name rescoreV2Certification
 *
 * @param {object} params
 * @param {ChallengeNeutralized|ChallengeDeneutralized|CertificationJuryDone|CertificationCourseRejected|CertificationCourseUnrejected|CertificationCancelled|CertificationRescored|CertificationUncancelled} params.event
 *
 * @returns {Promise<void>}
 */
export const rescoreV2Certification = async ({ event }) => {
  return usecases.rescoreV2Certification({ event });
};

/**
 * @function
 * @name selectNextCertificationChallenge
 *
 * @param {object} params
 * @param {number} params.assessmentId
 * @param {string} params.locale
 *
 * @returns {Promise<ChallengeToPlay>}
 * @throws {AssessmentEndedError} test ended or no next challenge available
 * @throws {AssessmentLackOfChallengesError} no eligible challenges remaining before reaching maximum assessment length
 */
export const selectNextCertificationChallenge = withTransaction(
  async ({
    assessmentId,
    locale,
    dependencies = {
      assessmentRepository,
    },
  }) => {
    const assessment = await dependencies.assessmentRepository.get(assessmentId);

    return usecases.getNextChallenge({ assessment, locale });
  },
);

/**
 * @function
 * @name evaluateAndSaveAnswer
 *
 * @param {object} params
 * @param {Answer} params.answer
 * @param {number} params.userId
 * @param {number} params.certificationCourseId
 * @param {boolean} params.forceOKAnswer
 *
 * @returns {Promise<Answer>} evaluated answer
 */
export async function evaluateAndSaveAnswer({ answer, userId, certificationCourseId, forceOKAnswer }) {
  return usecases.evaluateAndSaveAnswer({ answer, userId, certificationCourseId, forceOKAnswer });
}

/**
 * @function
 * @name completeCertificationAssessment
 *
 * @param {object} params
 * @param {number} params.certificationCourseId
 * @param {string} params.locale
 *
 * @returns {Promise<void>}
 */
export const completeCertificationAssessment = async ({ certificationCourseId, locale }) => {
  return usecases.completeCertificationAssessment({ certificationCourseId, locale });
};
