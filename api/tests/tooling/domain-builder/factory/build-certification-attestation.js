const CertificationAttestation = require('../../../../lib/domain/models/CertificationAttestation');
const buildAssessmentResult = require('./build-assessment-result');
const buildCleaCertificationResult = require('./build-clea-certification-result');

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
  pixScore,
  status,
  cleaCertificationResult = buildCleaCertificationResult.acquired(),
  resultCompetenceTree = null,
  verificationCode = 'P-BBBCCCDD',
  maxReachableLevelOnCertificationDate = 5,
} = {}) {
  const assessmentResult = buildAssessmentResult();
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
    pixScore: pixScore || assessmentResult.pixScore,
    status: status || assessmentResult.status,
    resultCompetenceTree,
    cleaCertificationResult,
    verificationCode,
    maxReachableLevelOnCertificationDate,
  });
};
