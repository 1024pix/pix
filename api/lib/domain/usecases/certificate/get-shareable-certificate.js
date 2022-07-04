module.exports = async function getShareableCertificate({ verificationCode, shareableCertificateRepository, locale }) {
  const shareableCertificate = await shareableCertificateRepository.getByVerificationCode(verificationCode, { locale });

  return shareableCertificate;
};
