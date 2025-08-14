import * as injectedCertificateRepository from '../../infrastructure/repositories/certificate-repository.js';
const findUserPrivateCertificates = async function ({
  userId,
  certificateRepository = injectedCertificateRepository,
} = {}) {
  return certificateRepository.findPrivateCertificatesByUserId({ userId });
};

export { findUserPrivateCertificates };
