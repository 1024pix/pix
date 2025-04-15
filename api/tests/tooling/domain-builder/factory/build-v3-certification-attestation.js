import { V3Certificate } from '../../../../src/certification/results/domain/models/V3Certificate.js';

const buildV3CertificationAttestation = async function ({
  id = 1,
  firstName = 'Jean',
  lastName = 'Bon',
  birthdate = '1992-06-12',
  birthplace = 'Paris',
  certificationCenter = 'L’université du Pix',
  deliveredAt = new Date('2025-10-30T01:02:03Z'),
  pixScore = 123,
  verificationCode = 'P-SOMECODE',
} = {}) {
  return new V3Certificate({
    id,
    firstName,
    lastName,
    birthdate,
    birthplace,
    certificationCenter,
    deliveredAt,
    pixScore,
    verificationCode,
  });
};

export { buildV3CertificationAttestation };
