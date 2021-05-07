const { decorateWithCleaStatusAndCompetenceTree } = require('./decorate-with-clea-status-and-competence-tree');

module.exports = async function getShareableCertificate({
  verificationCode,
  shareableCertificateRepository,
  cleaCertificationStatusRepository,
  competenceTreeRepository,
  assessmentResultRepository,
}) {
  const shareableCertificate = await shareableCertificateRepository.getByVerificationCode({ verificationCode });

  return decorateWithCleaStatusAndCompetenceTree({
    certificationId: shareableCertificate.id,
    toBeDecorated: shareableCertificate,
    maxReachableLevelOnCertificationDate: shareableCertificate.maxReachableLevelOnCertificationDate,
    cleaCertificationStatusRepository,
    assessmentResultRepository,
    competenceTreeRepository,
  });
};
