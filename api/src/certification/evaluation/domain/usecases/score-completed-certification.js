/**
 * // TODO: cross bounded-context violation
 * @typedef {import('../../../session-management/domain/models/CertificationAssessment.js').CertificationAssessment} CertificationAssessment
 * @typedef {import('./index.js').Services} Services
 * @typedef {import('./index.js').CertificationCourseRepository} CertificationCourseRepository
 * @typedef {import('./index.js').CertificationAssessmentRepository} CertificationAssessmentRepository
 */

import { withTransaction } from '../../../../shared/domain/DomainTransaction.js';

export const scoreCompletedCertification = withTransaction(
  /**
   * @param {Object} params
   * @param {number} params.certificationCourseId
   * @param {string} params.locale
   * @param {CertificationCourseRepository} params.certificationCourseRepository
   * @param {CertificationAssessmentRepository} params.certificationAssessmentRepository
   * @param {Services} params.services
   */
  async ({
    certificationCourseId,
    locale,
    certificationCourseRepository,
    certificationAssessmentRepository,
    pixPlusCertificationCourseRepository,
    services,
  }) => {
    const certificationAssessment = await certificationAssessmentRepository.getByCertificationCourseId({
      certificationCourseId,
    });

    const pixPlusCertificationCourse =
      await pixPlusCertificationCourseRepository.getByCertificationCourseId(certificationCourseId);

    if (!pixPlusCertificationCourse) {
      const certificationCourse = await services.handleV3CertificationScoring({
        certificationAssessment,
        locale,
        dependencies: {
          findByCertificationCourseAndVersion: services.findByCertificationCourseAndVersion,
        },
      });

      certificationCourse.complete({ now: new Date() });
      await certificationCourseRepository.update({ certificationCourse });

      return services.scoreDoubleCertificationV3({ certificationCourseId: certificationCourse.getId() });
    } else {
      const certificationCourse = await certificationCourseRepository.get({ id: certificationCourseId });

      certificationCourse.complete({ now: new Date() });
      await certificationCourseRepository.update({ certificationCourse });

      return;
    }
  },
);
