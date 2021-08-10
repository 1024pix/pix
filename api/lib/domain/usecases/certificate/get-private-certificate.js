const { NotFoundError } = require('../../errors');

module.exports = async function getPrivateCertificate({
  certificationId,
  userId,
  certificationRepository,
  privateCertificateRepository,
  verifyCertificateCodeService,
}) {
  const hasCode = await certificationRepository.hasVerificationCode(certificationId);
  if (!hasCode) {
    const code = await verifyCertificateCodeService.generateCertificateVerificationCode();
    await certificationRepository.saveVerificationCode(certificationId, code);
  }

  const privateCertificate = await privateCertificateRepository.get(certificationId);
  if (privateCertificate.userId !== userId) {
    throw new NotFoundError();
  }

  return privateCertificate;
};
