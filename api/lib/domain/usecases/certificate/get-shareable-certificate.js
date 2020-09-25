const { getCompleteCertificate } = require('./get-certificate');

module.exports = async function getShareableCertificate({
  verificationCode,
  certificationRepository,
  cleaCertificationStatusRepository,
  competenceTreeRepository,
  assessmentResultRepository,
}) {
  const certificate = await certificationRepository.getShareableCertificateByVerificationCode({ verificationCode });

  return getCompleteCertificate({
    certificate,
    cleaCertificationStatusRepository,
    assessmentResultRepository,
    competenceTreeRepository,
  });
};
