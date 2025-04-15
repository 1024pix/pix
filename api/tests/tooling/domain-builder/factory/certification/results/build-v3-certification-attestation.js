import { V3Certificate } from '../../../../../../src/certification/results/domain/models/V3Certificate.js';
import { AlgorithmEngineVersion } from '../../../../../../src/certification/shared/domain/models/AlgorithmEngineVersion.js';

const buildV3CertificationAttestation = function ({
  id = 1,
  firstName = 'Jean',
  lastName = 'Bon',
  birthdate = '1992-06-12',
  birthplace = 'Paris',
  certificationCenter = 'L’université du Pix',
  deliveredAt = new Date('2018-10-03T01:02:03Z'),
  pixScore = 123,
  verificationCode = 'P-SOMECODE',
  resultCompetenceTree = null,
  algorithmEngineVersion = AlgorithmEngineVersion.V3,
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
    resultCompetenceTree,
    algorithmEngineVersion,
  });
};

export { buildV3CertificationAttestation };
