const { getCertificate } = require('./get-certificate');
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

  return getCertificate({
    certificate: certificationAttestation,
    cleaCertificationStatusRepository,
    assessmentResultRepository,
    competenceTreeRepository,
  });
};
