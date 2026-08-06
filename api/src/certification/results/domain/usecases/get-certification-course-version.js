/**
 * @param {object} params
 * @param {number} params.certificationCourseId
 * @param {CertificationCourseRepository} params.certificationCourseRepository
 */
export async function getCertificationCourseVersion({ certificationCourseId, certificationCourseRepository }) {
  return certificationCourseRepository.getVersion({ certificationCourseId });
}
