const ShareableCertificate = require('../../../../lib/domain/models/ShareableCertificate');
const buildAssessmentResult = require('./build-assessment-result');
const buildCleaCertificationResult = require('./build-clea-certification-result');
const buildResultCompetenceTree = require('./build-result-competence-tree');

const buildShareableCertificate = function({
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
  maxReachableLevelOnCertificationDate = 5,
} = {}) {
  const assessmentResult = buildAssessmentResult();
  return new ShareableCertificate({
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
    maxReachableLevelOnCertificationDate,
  });
};

buildShareableCertificate.withCompetenceTree = function({
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
  status,
  cleaCertificationResult,
  maxReachableLevelOnCertificationDate,
  assessmentResults = [buildAssessmentResult()],
  // the id of the ResultCompetenceTree should be with the most recent assessment result.
  resultCompetenceTree = buildResultCompetenceTree({ id: `${id}-${assessmentResults[0].id}` }),
} = {}) {
  return buildShareableCertificate({
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
    status,
    cleaCertificationResult,
    maxReachableLevelOnCertificationDate,
    resultCompetenceTree,
  });
};

module.exports = buildShareableCertificate;
