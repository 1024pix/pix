const ShareableCertificate = require('../../../../lib/domain/models/ShareableCertificate');
const buildAssessmentResult = require('./build-assessment-result');

module.exports = function buildShareableCertificate({
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
  cleaCertificationStatus = 'acquired',
  resultCompetenceTree = null,
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
    cleaCertificationStatus,
  });
};
