const findUserPrivateCertificates = async function ({ userId, certificateRepository }) {
  return certificateRepository.findPrivateCertificatesByUserId({ userId });
};

export { findUserPrivateCertificates };
