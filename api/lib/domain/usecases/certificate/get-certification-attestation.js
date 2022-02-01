const { NotFoundError } = require('../../errors');

module.exports = async function getCertificationAttestation({
  userId,
  certificationId,
  certificationAttestationRepository,
}) {
  const certificationAttestation = await certificationAttestationRepository.get(certificationId);
  if (certificationAttestation.userId !== userId) {
    throw new NotFoundError();
  }

  return certificationAttestation;
};
