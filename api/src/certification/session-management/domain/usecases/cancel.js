/**
 * @typedef {import('./index.js').CertificationCourseRepository} CertificationCourseRepository
 * @typedef {import('./index.js').SessionRepository} SessionRepository
 * @typedef {import('./index.js').CertificationEvaluationRepository} CertificationEvaluationRepository
 * @typedef {import('./index.js').CourseAssessmentResultRepository} CourseAssessmentResultRepository
 */

import CertificationCancelled from '../../../../../src/shared/domain/events/CertificationCancelled.js';
import { NotFinalizedSessionError } from '../../../../shared/domain/errors.js';
import { NotFoundError } from '../../../../shared/domain/errors.js';
import { AlgorithmEngineVersion } from '../../../shared/domain/models/AlgorithmEngineVersion.js';

/**
 * @param {object} params
 * @param {number} params.certificationCourseId
 * @param {CertificationCourseRepository} params.certificationCourseRepository
 * @param {SessionManagementRepository} params.sessionManagementRepository
 * @param {CertificationEvaluationRepository} params.certificationEvaluationRepository
 * @param {CourseAssessmentResultRepository} params.courseAssessmentResultRepository
 */
export const cancel = async function ({
  certificationCourseId,
  juryId,
  certificationCourseRepository,
  sessionManagementRepository,
  certificationEvaluationRepository,
  courseAssessmentResultRepository,
}) {
  const certificationCourse = await certificationCourseRepository.get({ id: certificationCourseId });
  const isSessionFinalized = await sessionManagementRepository.isFinalized({ id: certificationCourse.getSessionId() });
  if (!isSessionFinalized) {
    throw new NotFinalizedSessionError();
  }

  const latestAssessmentResult = await courseAssessmentResultRepository.getLatestAssessmentResult({
    certificationCourseId,
  });
  if (!latestAssessmentResult) {
    throw new NotFoundError('No assessment result found');
  }

  const event = new CertificationCancelled({
    certificationCourseId,
    juryId,
  });

  if (AlgorithmEngineVersion.isV3(certificationCourse.getVersion())) {
    await certificationEvaluationRepository.rescoreV3Certification({ event });
  }

  if (AlgorithmEngineVersion.isV2(certificationCourse.getVersion())) {
    await certificationEvaluationRepository.rescoreV2Certification({ event });
  }
};
