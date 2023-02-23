const { NotFoundError } = require('../../errors.js');

module.exports = async function getCertificationAttestation({ userId, certificationId, certificateRepository }) {
  const certificationAttestation = await certificateRepository.getCertificationAttestation(certificationId);
  if (certificationAttestation.userId !== userId) {
    throw new NotFoundError();
  }

  return certificationAttestation;
};
