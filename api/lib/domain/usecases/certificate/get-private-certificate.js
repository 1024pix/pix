const { getCertificate } = require('./get-certificate');
const { NotFoundError } = require('../../errors');

module.exports = async function getPrivateCertificate({
  certificationId,
  userId,
  certificationRepository,
  cleaCertificationStatusRepository,
  assessmentResultRepository,
  competenceTreeRepository,
}) {
  const certificate = await certificationRepository.getPrivateCertificateByCertificationCourseId({ id: certificationId });
  if (certificate.userId !== userId) {
    throw new NotFoundError();
  }

  return getCertificate({
    certificate,
    cleaCertificationStatusRepository,
    assessmentResultRepository,
    competenceTreeRepository
  });
};
