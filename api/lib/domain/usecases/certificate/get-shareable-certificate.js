export default async function getShareableCertificate({ verificationCode, certificateRepository, locale }) {
  const shareableCertificate = await certificateRepository.getShareableCertificateByVerificationCode(verificationCode, {
    locale,
  });

  return shareableCertificate;
}
