const { getCertificate } = require('./get-certificate');

module.exports = async function getShareableCertificate({
  verificationCode,
  certificationRepository,
  cleaCertificationStatusRepository,
  competenceTreeRepository,
  assessmentResultRepository
}) {
  const getBaseCertificate = async () => certificationRepository.getShareableCertificateByVerificationCode({ verificationCode });
  const isAccessToCertificateAuthorized = (certification) => true;

  return getCertificate({
    getBaseCertificate,
    isAccessToCertificateAuthorized,
    cleaCertificationStatusRepository,
    assessmentResultRepository,
    competenceTreeRepository
  });
};
