/**
 * @typedef {import ('../../domain/usecases/index.js').CertificateRepository} CertificateRepository
 * @typedef {import ('../../domain/usecases/index.js').CertificationCourseRepository} CertificationCourseRepository
 */

/**
 * @param {Object} params
 * @param {CertificateRepository} params.certificateRepository
 * @param {CertificationCourseRepository} params.certificationCourseRepository
 */
export const getCertificationAttestation = async function ({ certificationCourseId, certificateRepository }) {
  return certificateRepository.getCertificationAttestation({ certificationCourseId });
};
