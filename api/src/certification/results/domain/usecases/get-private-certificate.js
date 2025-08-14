import * as injectedCertificateRepository from '../../infrastructure/repositories/certificate-repository.js'; /**
 * @typedef {import('./index.js').CertificateRepository} CertificateRepository
 */

/**
 * @param {Object} params
 * @param {number} params.certificationCourseId
 * @param {string} params.locale
 * @param {CertificateRepository} params.certificateRepository
 *
 * @returns {PrivateCertificate}
 **/
const getPrivateCertificate = async function ({
  certificationCourseId,
  locale,
  certificateRepository = injectedCertificateRepository,
} = {}) {
  return certificateRepository.getPrivateCertificate(certificationCourseId, { locale });
};

export { getPrivateCertificate };
