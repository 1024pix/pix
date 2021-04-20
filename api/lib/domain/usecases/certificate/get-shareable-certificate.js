const { decorateWithCleaStatusAndCompetenceTree } = require('./decorate-with-clea-status-and-competence-tree');

module.exports = async function getShareableCertificate({
  verificationCode,
  certificationRepository,
  cleaCertificationResultRepository,
  competenceTreeRepository,
  assessmentResultRepository,
}) {
  const certificate = await certificationRepository.getShareableCertificateByVerificationCode({ verificationCode });

  return decorateWithCleaStatusAndCompetenceTree({
    certificationId: certificate.id,
    toBeDecorated: certificate,
    maxReachableLevelOnCertificationDate: certificate.maxReachableLevelOnCertificationDate,
    cleaCertificationResultRepository,
    assessmentResultRepository,
    competenceTreeRepository,
  });
};
