import * as injectedCertificateRepository from '../../infrastructure/repositories/certificate-repository.js'; /**
 * @typedef {import ('../../domain/usecases/index.js').CertificateRepository} CertificateRepository
 */

/**
 * @param {Object} params
 * @param {number} params.certificationCourseId
 * @param {string} params.locale
 * @param {CertificateRepository} params.certificateRepository
 */

const getShareableCertificate = async function ({
  certificationCourseId,
  locale,
  certificateRepository = injectedCertificateRepository,
} = {}) {
  return certificateRepository.getShareableCertificate({
    certificationCourseId,
    locale,
  });
};

export { getShareableCertificate };
