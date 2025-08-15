/**
 * @typedef {import('./index.js').CertificationCourseRepository} CertificationCourseRepository
 * @typedef {import('./index.js').CertificationRescoringRepository} CertificationRescoringRepository
 * @typedef {import('./index.js').SessionRepository} SessionRepository
 */

import { NotFinalizedSessionError } from '../../../../shared/domain/errors.js';
import CertificationUncancelled from '../../../../shared/domain/events/CertificationUncancelled.js';
import { AlgorithmEngineVersion } from '../../../shared/domain/models/AlgorithmEngineVersion.js';
import * as injectedCertificationCourseRepository from '../../../shared/infrastructure/repositories/certification-course-repository.js';
import * as injectedCertificationRescoringRepository from '../../infrastructure/repositories/certification-rescoring-repository.js';
import * as injectedSessionRepository from '../../infrastructure/repositories/session-repository.js';

/**
 * @param {Object} params
 * @param {number} params.certificationCourseId
 * @param {number} params.juryId
 * @param {CertificationCourseRepository} params.certificationCourseRepository
 * @param {CertificationRescoringRepository} params.certificationRescoringRepository
 * @param {SessionRepository} params.SessionRepository
 */
export const uncancel = async function ({
  certificationCourseId,
  juryId,
  certificationCourseRepository = injectedCertificationCourseRepository,
  certificationRescoringRepository = injectedCertificationRescoringRepository,
  sessionRepository = injectedSessionRepository,
} = {}) {
  const certificationCourse = await certificationCourseRepository.get({ id: certificationCourseId });
  const session = await sessionRepository.get({ id: certificationCourse.getSessionId() });
  if (!session.isFinalized) {
    throw new NotFinalizedSessionError();
  }

  const event = new CertificationUncancelled({
    certificationCourseId: certificationCourse.getId(),
    juryId,
  });

  if (AlgorithmEngineVersion.isV3(certificationCourse.getVersion())) {
    return certificationRescoringRepository.rescoreV3Certification({ event });
  }

  if (AlgorithmEngineVersion.isV2(certificationCourse.getVersion())) {
    return certificationRescoringRepository.rescoreV2Certification({ event });
  }
};
