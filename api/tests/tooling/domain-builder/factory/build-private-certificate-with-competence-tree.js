const PrivateCertificate = require('../../../../lib/domain/models/PrivateCertificate');
const buildAssessmentResult = require('./build-assessment-result');
const buildResultCompetenceTree = require('./build-result-competence-tree');
const buildCleaCertificationResult = require('./build-clea-certification-result');

module.exports = function buildPrivateCertificate({
  id = 1,
  assessmentResults = [buildAssessmentResult()],
  assessmentState = 'completed',
  birthdate = '1992-06-12',
  birthplace = 'Paris',
  certificationCenter = 'L’univeristé du Pix',
  date = new Date('2018-12-01T01:02:03Z'),
  firstName = 'Jean',
  deliveredAt = new Date('2018-10-03T01:02:03Z'),
  isPublished = true,
  lastName = 'Bon',
  userId = 1,
  // set to overried computed properties
  commentForCandidate,
  pixScore,
  status,
  verificationCode = 'P-BBBCCCDD',
  maxReachableLevelOnCertificationDate = 5,
  cleaCertificationResult = buildCleaCertificationResult.acquired(),

  // the id of the ResultCompetenceTree should be with the most recent assessment result.
  resultCompetenceTree = buildResultCompetenceTree({ id: `${id}-${assessmentResults[0].id}` }),
} = {}) {

  const certificate = new PrivateCertificate({
    id,
    assessmentState,
    assessmentResults,
    birthdate,
    birthplace,
    certificationCenter,
    date,
    firstName,
    deliveredAt,
    isPublished,
    lastName,
    userId,
    resultCompetenceTree,
    cleaCertificationResult,
    verificationCode,
    maxReachableLevelOnCertificationDate,
  });

  if (pixScore !== undefined) {
    certificate.pixScore = pixScore;
  }
  if (status !== undefined) {
    certificate.status = status;
  }
  if (commentForCandidate !== undefined) {
    certificate.commentForCandidate = commentForCandidate;
  }
  if (commentForCandidate !== undefined) {
    certificate.commentForCandidate = commentForCandidate;
  }

  return certificate;
};
