import { NotFoundError } from '../../../../shared/domain/errors.js';

const getCertificationAttestation = async function ({ userId, certificationCourseId, certificateRepository }) {
  const certificationAttestation = await certificateRepository.getCertificationAttestation({
    certificationCourseId,
  });
  if (certificationAttestation.userId !== userId) {
    throw new NotFoundError();
  }

  return certificationAttestation;
};

export { getCertificationAttestation };
