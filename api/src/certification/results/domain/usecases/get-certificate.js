import * as injectedCertificateRepository from '../../infrastructure/repositories/certificate-repository.js'; /**
 * @typedef {import ('../../domain/usecases/index.js').CertificateRepository} CertificateRepository
 */

/**
 * @param {Object} params
 * @param {CertificateRepository} params.certificateRepository
 */
export const getCertificate = async function ({
  certificationCourseId,
  locale,
  certificateRepository = injectedCertificateRepository,
} = {}) {
  return certificateRepository.getCertificate({ certificationCourseId, locale });
};
