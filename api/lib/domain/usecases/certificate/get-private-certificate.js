const { NotFoundError } = require('../../errors');

module.exports = async function getPrivateCertificate({
  certificationId,
  userId,
  certificationRepository,
  privateCertificateRepository,
  assessmentResultRepository,
  competenceTreeRepository,
  verifyCertificateCodeService,
  resultCompetenceTreeService,
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

  const resultCompetenceTree = await resultCompetenceTreeService.computeForCertification({
    certificationId,
    assessmentResultRepository,
    competenceTreeRepository,
  });
  privateCertificate.setResultCompetenceTree(resultCompetenceTree);

  return privateCertificate;
};
