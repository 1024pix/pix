const { getCertificate } = require('./get-certificate');

module.exports = async function getShareableCertificate({
  pixScore,
  verificationCode,
  certificationRepository,
  cleaCertificationStatusRepository,
  competenceTreeRepository,
  assessmentResultRepository
}) {
  const getBaseCertificate = async () => certificationRepository.getShareableCertificateByVerificationCode({ verificationCode });
  const isAccessToCertificateAuthorized = (certification) => certification.pixScore === pixScore;

  return getCertificate({
    getBaseCertificate,
    isAccessToCertificateAuthorized,
    cleaCertificationStatusRepository,
    assessmentResultRepository,
    competenceTreeRepository
  });
};
