const { getCertificate } = require('./get-certificate');

module.exports = async function getShareableCertificate({
  verificationCode,
  certificationRepository,
  cleaCertificationStatusRepository,
  competenceTreeRepository,
  assessmentResultRepository
}) {
  const splitInputCode = verificationCode && verificationCode.toUpperCase().split('-');
  const certificationVerificationCode = splitInputCode && splitInputCode.slice(0,2).join('-');
  const pixScore = splitInputCode && splitInputCode[2];

  const getBaseCertificate = async () => certificationRepository.getShareableCertificateByVerificationCode({ verificationCode: certificationVerificationCode });
  const isAccessToCertificateAuthorized = (certification) => certification.pixScore == pixScore;

  return getCertificate({
    getBaseCertificate,
    isAccessToCertificateAuthorized,
    cleaCertificationStatusRepository,
    assessmentResultRepository,
    competenceTreeRepository
  });
};
