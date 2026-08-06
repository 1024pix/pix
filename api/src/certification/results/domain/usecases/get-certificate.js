/**
 * @typedef {import ('../../domain/usecases/index.js').CertificateRepository} CertificateRepository
 */

/**
 * @param {object} params
 * @param {CertificateRepository} params.certificateRepository
 */
export async function getCertificate({ certificationCourseId, locale, certificateRepository }) {
  return certificateRepository.getCertificate({ certificationCourseId, locale });
}
