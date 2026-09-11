/**
 * @typedef {import('./index.js').CertificationCourseRepository} CertificationCourseRepository
 * @typedef {import('./index.js').CertificationEvaluationRepository} CertificationEvaluationRepository
 * @typedef {import('./index.js').SessionRepository} SessionRepository
 */

import { NotFinalizedSessionError } from '../../../../shared/domain/errors.js';
import CertificationUncancelled from '../../../../shared/domain/events/CertificationUncancelled.js';
import { AlgorithmEngineVersion } from '../../../shared/domain/models/AlgorithmEngineVersion.js';

/**
 * @param {object} params
 * @param {number} params.certificationCourseId
 * @param {number} params.juryId
 * @param {CertificationCourseRepository} params.certificationCourseRepository
 * @param {CertificationEvaluationRepository} params.certificationEvaluationRepository
 * @param {SessionManagementRepository} params.sessionManagementRepository
 */
export async function uncancel({
  certificationCourseId,
  juryId,
  certificationCourseRepository,
  certificationEvaluationRepository,
  sessionManagementRepository,
}) {
  const certificationCourse = await certificationCourseRepository.get({ id: certificationCourseId });
  const isSessionFinalized = await sessionManagementRepository.isFinalized({ id: certificationCourse.getSessionId() });
  if (!isSessionFinalized) {
    throw new NotFinalizedSessionError();
  }

  const event = new CertificationUncancelled({
    certificationCourseId: certificationCourse.getId(),
    juryId,
  });

  if (AlgorithmEngineVersion.isV3(certificationCourse.getVersion())) {
    return certificationEvaluationRepository.rescoreV3Certification({ event });
  }

  if (AlgorithmEngineVersion.isV2(certificationCourse.getVersion())) {
    return certificationEvaluationRepository.rescoreV2Certification({ event });
  }
}
