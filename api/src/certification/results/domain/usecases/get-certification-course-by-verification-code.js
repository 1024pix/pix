import * as injectedResultsCertificationCourseRepository from '../../infrastructure/repositories/certification-course-repository.js'; /**
 * @typedef {import ('../../domain/usecases/index.js').ResultsCertificationCourseRepository} ResultsCertificationCourseRepository
 */

/**
 * @param {Object} params
 * @param {string} params.verificationCode
 * @param {ResultsCertificationCourseRepository} params.resultsCertificationCourseRepository
 */
export const getCertificationCourseByVerificationCode = async function ({
  verificationCode,
  resultsCertificationCourseRepository = injectedResultsCertificationCourseRepository,
} = {}) {
  return resultsCertificationCourseRepository.getByVerificationCode({ verificationCode });
};
