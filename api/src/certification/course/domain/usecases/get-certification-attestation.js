import { NotFoundError } from '../../../../shared/domain/errors.js';

const getCertificationAttestation = async function ({ userId, certificationId, certificateRepository }) {
  const certificationAttestation = await certificateRepository.getCertificationAttestation(certificationId);
  if (certificationAttestation.userId !== userId) {
    throw new NotFoundError();
  }

  return certificationAttestation;
};

export { getCertificationAttestation };
