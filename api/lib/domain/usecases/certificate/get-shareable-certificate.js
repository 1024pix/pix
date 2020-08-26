const { getCertificate } = require('./get-certificate');

module.exports = async function getShareableCertificate({
  verificationCode,
  certificationRepository,
  cleaCertificationStatusRepository,
  competenceTreeRepository,
  assessmentResultRepository
}) {
  const certificate = await certificationRepository.getShareableCertificateByVerificationCode({ verificationCode });

  return getCertificate({
    certificate,
    cleaCertificationStatusRepository,
    assessmentResultRepository,
    competenceTreeRepository
  });
};
