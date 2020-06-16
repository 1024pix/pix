const Certification = require('../../../../lib/domain/models/Certification');
const buildAssessmentResult = require('./build-assessment-result');

module.exports = function buildCertification({
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
  commentForCandidate,
  pixScore,
  status,
  cleaCertificationStatus = 'acquired',
  resultCompetenceTree = null,
} = {}) {
  const assessmentResult = buildAssessmentResult();
  return new Certification({
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
    commentForCandidate: commentForCandidate || assessmentResult.commentForCandidate,
    pixScore: pixScore || assessmentResult.pixScore,
    status: status || assessmentResult.status,
    resultCompetenceTree,
    cleaCertificationStatus,
  });
};
