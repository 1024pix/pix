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
 * @typedef {import ('../../../../shared/domain/models/Challenge.js').Challenge} Challenge
 */
import { DomainTransaction, withTransaction } from '../../../../shared/domain/DomainTransaction.js';
import { Assessment } from '../../../../shared/domain/models/Assessment.js';
import { usecases } from '../../domain/usecases/index.js';
import * as assessmentRepository from '../../infrastructure/repositories/assessment-repository.js';
import * as certificationCourseRepository from '../../../shared/infrastructure/repositories/certification-course-repository.js';
import { AssessmentLackOfChallengesError } from '../../../../shared/domain/errors.js';
import { logger } from '../../../../shared/infrastructure/utils/logger.js';
import { ABORT_REASONS } from '../../../shared/domain/constants/abort-reasons.js';

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
 * @returns {Promise<Challenge>}
 * @throws {AssessmentEndedError} test ended or no next challenge available
 * @throws {AssessmentLackOfChallengesError} no eligible challenges remaining before reaching maximum assessment length
 */
export const selectNextCertificationChallenge =
  async ({
    assessmentId,
    locale,
    dependencies = {
      assessmentRepository,
      certificationCourseRepository,
    },
  }) => {
    const assessment = await dependencies.assessmentRepository.get(assessmentId);
    try {
      return await DomainTransaction.execute(async () => {
        return await usecases.getNextChallenge({ assessment, locale });
      });
    } catch (error) {
      if (error instanceof AssessmentLackOfChallengesError) {
        logger.warn(
          {
            assessmentId: assessment.id,
            numberOfAnswers: error.numberOfAnswers,
            maximumAssessmentLength: error.maximumAssessmentLength,
          },
          'Assessment ended prematurely: no challenge remaining before reaching maximum assessment length',
        );

        await DomainTransaction.execute(async () => {
          const certificationCourse = await certificationCourseRepository.get({ id: assessment.certificationCourseId });
          certificationCourse.abort(ABORT_REASONS.TECHNICAL);
          await certificationCourseRepository.update({ certificationCourse });
          await dependencies.assessmentRepository.updateStateById(assessment.id, Assessment.states.ABORTED)
        });
        throw error;
      }
    }
  }


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
