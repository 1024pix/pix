module.exports = async function getShareableCertificate({ verificationCode, shareableCertificateRepository }) {
  const shareableCertificate = await shareableCertificateRepository.getByVerificationCode(verificationCode);

  return shareableCertificate;
};
