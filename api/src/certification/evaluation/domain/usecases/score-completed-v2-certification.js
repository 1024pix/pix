/**
 * // TODO: cross bounded-context violation
 * @typedef {import('../../../session-management/domain/models/CertificationAssessment.js').CertificationAssessment} CertificationAssessment
 * @typedef {import('./index.js').Services} Services
 * @typedef {import('./index.js').AssessmentResultRepository} AssessmentResultRepository
 * @typedef {import('./index.js').CertificationCourseRepository} CertificationCourseRepository
 * @typedef {import('./index.js').ComplementaryCertificationScoringCriteriaRepository} ComplementaryCertificationScoringCriteriaRepository
 */

import { AssessmentResultFactory } from '../../../scoring/domain/models/factories/AssessmentResultFactory.js';
import { assessmentResultRepository as injectedAssessmentResultRepository } from '../../../session-management/infrastructure/repositories/index.js';
import * as injectedCertificationCourseRepository from '../../../shared/infrastructure/repositories/certification-course-repository.js';
import * as injectedComplementaryCertificationScoringCriteriaRepository from '../../infrastructure/repositories/complementary-certification-scoring-criteria-repository.js';
import { CertificationComputeError } from '../errors.js';
import { services as injectedServices } from '../services/index.js';

/**
 * @param {Object} params
 * @param {CertificationAssessment} params.certificationAssessment
 * @param {AssessmentResultRepository} params.assessmentResultRepository
 * @param {CertificationCourseRepository} params.certificationCourseRepository
 * @param {ComplementaryCertificationScoringCriteriaRepository} params.complementaryCertificationScoringCriteriaRepository
 * @param {Services} params.services
 */
export const scoreCompletedV2Certification = async ({
  certificationAssessment,
  assessmentResultRepository = injectedAssessmentResultRepository,
  certificationCourseRepository = injectedCertificationCourseRepository,
  complementaryCertificationScoringCriteriaRepository = injectedComplementaryCertificationScoringCriteriaRepository,
  services = injectedServices,
} = {}) => {
  if (certificationAssessment.isScoringBlockedDueToComplementaryOnlyChallenges) {
    return;
  }

  try {
    const certificationCourse = await services.handleV2CertificationScoring({
      certificationAssessment,
    });

    certificationCourse.complete({ now: new Date() });
    await certificationCourseRepository.update({ certificationCourse });

    const complementaryCertificationScoringCriteria =
      await complementaryCertificationScoringCriteriaRepository.findByCertificationCourseId({
        certificationCourseId: certificationCourse.getId(),
      });

    if (complementaryCertificationScoringCriteria.length > 0) {
      await services.scoreComplementaryCertificationV2({
        certificationCourseId: certificationCourse.getId(),
        complementaryCertificationScoringCriteria: complementaryCertificationScoringCriteria[0],
      });
    }
  } catch (error) {
    if (!(error instanceof CertificationComputeError)) {
      throw error;
    }
    await _saveResultAfterCertificationComputeError({
      certificationAssessment,
      assessmentResultRepository,
      certificationCourseRepository,
      certificationComputeError: error,
    });
  }
};

/**
 * @param {Object} params
 * @param {CertificationAssessment} params.certificationAssessment
 * @param {AssessmentResultRepository} params.assessmentResultRepository
 * @param {CertificationCourseRepository} params.certificationCourseRepository
 */
async function _saveResultAfterCertificationComputeError({
  certificationAssessment,
  assessmentResultRepository,
  certificationCourseRepository,
  certificationComputeError,
}) {
  const certificationCourse = await certificationCourseRepository.get({
    id: certificationAssessment.certificationCourseId,
  });
  const assessmentResult = AssessmentResultFactory.buildAlgoErrorResult({
    error: certificationComputeError,
    assessmentId: certificationAssessment.id,
  });
  await assessmentResultRepository.save({
    certificationCourseId: certificationAssessment.certificationCourseId,
    assessmentResult,
  });
  certificationCourse.complete({ now: new Date() });
  return certificationCourseRepository.update({ certificationCourse });
}
