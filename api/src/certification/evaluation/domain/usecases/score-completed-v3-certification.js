/**
 * // TODO: cross bounded-context violation
 * @typedef {import('../../../session-management/domain/models/CertificationAssessment.js').CertificationAssessment} CertificationAssessment
 * @typedef {import('./index.js').Services} Services
 * @typedef {import('./index.js').CertificationCourseRepository} CertificationCourseRepository
 */

import { withTransaction } from '../../../../shared/domain/DomainTransaction.js';
import * as injectedCertificationCourseRepository from '../../../shared/infrastructure/repositories/certification-course-repository.js';
import { services as injectedServices } from '../services/index.js';

/**
 * @param {Object} params
 * @param {CertificationAssessment} params.certificationAssessment
 * @param {string} params.locale
 * @param {CertificationCourseRepository} params.certificationCourseRepository
 * @param {Services} params.services
 */
export const scoreCompletedV3Certification = withTransaction(
  async ({
    certificationAssessment,
    locale,
    certificationCourseRepository = injectedCertificationCourseRepository,
    services = injectedServices,
  } = {}) => {
    if (certificationAssessment.isScoringBlockedDueToComplementaryOnlyChallenges) {
      return;
    }

    const certificationCourse = await services.handleV3CertificationScoring({
      certificationAssessment,
      locale,
      dependencies: { findByCertificationCourseIdAndAssessmentId: services.findByCertificationCourseIdAndAssessmentId },
    });

    certificationCourse.complete({ now: new Date() });
    await certificationCourseRepository.update({ certificationCourse });

    return services.scoreDoubleCertificationV3({ certificationCourseId: certificationCourse.getId() });
  },
);
