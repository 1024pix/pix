const { getCertificate } = require('./get-certificate');

module.exports = async function getPrivateCertificate({
  certificationId,
  userId,
  certificationRepository,
  cleaCertificationStatusRepository,
  assessmentResultRepository,
  competenceTreeRepository,
}) {
  const getBaseCertificate = async () => certificationRepository.getPrivateCertificateByCertificationCourseId({ id: certificationId });
  const isAccessToCertificateAuthorized = (certification) => certification.userId === userId;

  return getCertificate({
    getBaseCertificate,
    isAccessToCertificateAuthorized,
    cleaCertificationStatusRepository,
    assessmentResultRepository,
    competenceTreeRepository
  });
};
