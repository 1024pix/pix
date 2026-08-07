/**
 * @typedef {import ('../../domain/usecases/index.js').CertificateRepository} CertificateRepository
 */

/**
 * @param {object} params
 * @param {number} params.certificationCourseId
 * @param {string} params.locale
 * @param {CertificateRepository} params.certificateRepository
 */

export async function getShareableCertificate({ certificationCourseId, locale, certificateRepository }) {
  return certificateRepository.getShareableCertificate({
    certificationCourseId,
    locale,
  });
}
