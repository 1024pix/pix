const getShareableCertificate = async function ({ verificationCode, certificateRepository, locale }) {
  const shareableCertificate = await certificateRepository.getShareableCertificateByVerificationCode(verificationCode, {
    locale,
  });

  return shareableCertificate;
};

export { getShareableCertificate };
