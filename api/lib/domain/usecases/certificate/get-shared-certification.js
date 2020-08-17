const { getCertificationResult } = require('./get-certification-result');

// TODO : get-certificate-by-verification-code-and-pix-score
// TODO : Faire apparaitre la notion de "partage"
module.exports = async function getCertificationByVerificationCode({
  pixScore,
  verificationCode,
  certificationRepository,
  cleaCertificationStatusRepository,
  competenceTreeRepository,
  assessmentResultRepository
}) {
  const getCertification = async () => certificationRepository.getCertificationByVerificationCode({ verificationCode });
  const isAuthorized = (certification) => certification.pixScore === pixScore;

  return getCertificationResult({
    getCertification,
    isAuthorized,
    cleaCertificationStatusRepository,
    assessmentResultRepository,
    competenceTreeRepository
  });
};
