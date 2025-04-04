import { V3Certification } from '../../../../../../src/certification/results/domain/models/V3Certification.js';

const buildV3Certification = function ({
  id = 1,
  firstName = 'Jean',
  lastName = 'Bon',
  birthdate = '1992-06-12',
  birthplace = 'Paris',
  certificationCenter = 'L’université du Pix',
  deliveredAt = new Date('2018-10-03T01:02:03Z'),
  pixScore = 123,
  verificationCode = 'P-SOMECODE',
} = {}) {
  return new V3Certification({
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

export { buildV3Certification };
