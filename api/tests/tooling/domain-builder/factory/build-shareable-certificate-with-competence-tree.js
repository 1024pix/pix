const ShareableCertificate = require('../../../../lib/domain/models/ShareableCertificate');
const buildAssessmentResult = require('./build-assessment-result');
const buildResultCompetenceTree = require('./build-result-competence-tree');

module.exports = function buildShareableCertificate({
  id = 1,
  assessmentResults = [buildAssessmentResult()],
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
  cleaCertificationStatus = 'acquired',
  maxReachableLevelOnCertificationDate = 5,

  // the id of the ResultCompetenceTree should be with the most recent assessment result.
  resultCompetenceTree = buildResultCompetenceTree({ id: `${id}-${assessmentResults[0].id}` }),
} = {}) {

  const certificate = new ShareableCertificate({
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
    resultCompetenceTree,
    cleaCertificationStatus,
    maxReachableLevelOnCertificationDate,
  });

  if (pixScore !== undefined) {
    certificate.pixScore = pixScore;
  }

  return certificate;
};
