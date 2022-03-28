const CertificationAttestation = require('../../../../lib/domain/models/CertificationAttestation');

module.exports = function buildCertificationAttestation({
  id = 1,
  firstName = 'Jean',
  lastName = 'Bon',
  birthdate = '1992-06-12',
  birthplace = 'Paris',
  isPublished = true,
  userId = 1,
  certificationCenter = 'L’univeristé du Pix',
  date = new Date('2018-12-01T01:02:03Z'),
  deliveredAt = new Date('2018-10-03T01:02:03Z'),
  pixScore = 123,
  maxReachableLevelOnCertificationDate = 5,
  verificationCode = 'P-SOMECODE',
  acquiredComplementaryCertifications = [],
  resultCompetenceTree = null,
} = {}) {
  return new CertificationAttestation({
    id,
    firstName,
    lastName,
    birthdate,
    birthplace,
    isPublished,
    userId,
    certificationCenter,
    date,
    deliveredAt,
    pixScore,
    maxReachableLevelOnCertificationDate,
    verificationCode,
    acquiredComplementaryCertifications,
    resultCompetenceTree,
  });
};
