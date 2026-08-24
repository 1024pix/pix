/**
 * @typedef {import('./index.js').CertificateRepository} CertificateRepository
 */

/**
 * @param {object} params
 * @param {number} params.certificationCourseId
 * @param {string} params.locale
 * @param {CertificateRepository} params.certificateRepository
 *
 * @returns {PrivateCertificate}
 **/
export async function getPrivateCertificate({ certificationCourseId, locale, certificateRepository }) {
  return certificateRepository.getPrivateCertificate(certificationCourseId, { locale });
}
