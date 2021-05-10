module.exports = async function getShareableCertificate({
  verificationCode,
  shareableCertificateRepository,
  competenceTreeRepository,
  assessmentResultRepository,
  resultCompetenceTreeService,
}) {
  const shareableCertificate = await shareableCertificateRepository.getByVerificationCode(verificationCode);

  const resultCompetenceTree = await resultCompetenceTreeService.computeForCertification({
    certificationId: shareableCertificate.id,
    assessmentResultRepository,
    competenceTreeRepository,
  });
  shareableCertificate.setResultCompetenceTree(resultCompetenceTree);

  return shareableCertificate;
};
