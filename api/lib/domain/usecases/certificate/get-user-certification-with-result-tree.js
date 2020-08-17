const { getCertificationResult } = require('./get-certification-result');

// TODO : get-certificate-by-user-id
module.exports = async function getUserCertificationWithResultTree({
  certificationId,
  userId,
  certificationRepository,
  cleaCertificationStatusRepository,
  assessmentResultRepository,
  competenceTreeRepository,
}) {
  const getCertification = async () => certificationRepository.getByCertificationCourseId({ id: certificationId });
  const isAuthorized = (certification) => certification.userId === userId;

  return getCertificationResult({
    getCertification,
    isAuthorized,
    cleaCertificationStatusRepository,
    assessmentResultRepository,
    competenceTreeRepository
  });
};
