const { decorateWithCleaStatusAndCompetenceTree } = require('./decorate-with-clea-status-and-competence-tree');

module.exports = async function getShareableCertificate({
  verificationCode,
  certificationRepository,
  cleaCertificationStatusRepository,
  competenceTreeRepository,
  assessmentResultRepository,
}) {
  const certificate = await certificationRepository.getShareableCertificateByVerificationCode({ verificationCode });

  return decorateWithCleaStatusAndCompetenceTree({
    certificationId: certificate.id,
    toBeDecorated: certificate,
    cleaCertificationStatusRepository,
    assessmentResultRepository,
    competenceTreeRepository,
  });
};
