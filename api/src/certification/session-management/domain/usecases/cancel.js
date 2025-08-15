/**
 * @typedef {import('./index.js').CertificationCourseRepository} CertificationCourseRepository
 * @typedef {import('./index.js').SessionRepository} SessionRepository
 * @typedef {import('./index.js').CertificationRescoringRepository} CertificationRescoringRepository
 */

import CertificationCancelled from '../../../../../src/shared/domain/events/CertificationCancelled.js';
import { NotFinalizedSessionError } from '../../../../shared/domain/errors.js';
import { AlgorithmEngineVersion } from '../../../shared/domain/models/AlgorithmEngineVersion.js';
import * as injectedCertificationCourseRepository from '../../../shared/infrastructure/repositories/certification-course-repository.js';
import * as injectedCertificationRescoringRepository from '../../infrastructure/repositories/certification-rescoring-repository.js';
import * as injectedSessionRepository from '../../infrastructure/repositories/session-repository.js';

/**
 * @param {Object} params
 * @param {number} params.certificationCourseId
 * @param {CertificationCourseRepository} params.certificationCourseRepository
 * @param {SessionRepository} params.sessionRepository
 * @param {CertificationRescoringRepository} params.certificationRescoringRepository
 */
export const cancel = async function ({
  certificationCourseId,
  juryId,
  certificationCourseRepository = injectedCertificationCourseRepository,
  sessionRepository = injectedSessionRepository,
  certificationRescoringRepository = injectedCertificationRescoringRepository,
} = {}) {
  const certificationCourse = await certificationCourseRepository.get({ id: certificationCourseId });
  const session = await sessionRepository.get({ id: certificationCourse.getSessionId() });
  if (!session.isFinalized) {
    throw new NotFinalizedSessionError();
  }

  const event = new CertificationCancelled({
    certificationCourseId,
    juryId,
  });

  if (AlgorithmEngineVersion.isV3(certificationCourse.getVersion())) {
    await certificationRescoringRepository.rescoreV3Certification({ event });
  }

  if (AlgorithmEngineVersion.isV2(certificationCourse.getVersion())) {
    await certificationRescoringRepository.rescoreV2Certification({ event });
  }
};
