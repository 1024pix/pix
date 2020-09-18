const { getCompleteCertificate } = require('./get-certificate');
const { NotFoundError } = require('../../errors');

module.exports = async function getCertificationAttestation({
  userId,
  certificationId,
  certificationRepository,
  cleaCertificationStatusRepository,
  assessmentResultRepository,
  competenceTreeRepository,
}) {
  const certificationAttestation = await certificationRepository.getCertificationAttestation({ id: certificationId });
  if (certificationAttestation.userId !== userId) {
    throw new NotFoundError();
  }

  return await getCompleteCertificate({
    certificate: certificationAttestation,
    assessmentResultRepository,
    competenceTreeRepository,
    cleaCertificationStatusRepository,
  });
};
