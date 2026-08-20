/**
 * @typedef {import ('../../domain/usecases/index.js').CertificationCourseRepository} CertificationCourseRepository
 */

/**
 * @param {object} params
 * @param {string} params.verificationCode
 * @param {CertificationCourseRepository} params.certificationCourseRepository
 */
export async function getCertificationCourseByVerificationCode({ verificationCode, certificationCourseRepository }) {
  return certificationCourseRepository.getByVerificationCode({ verificationCode });
}
