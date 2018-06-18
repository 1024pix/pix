const Certification = require('../../lib/domain/models/Certification');
const buildAssessmentResult = require('./build-assessment-result');
const buildResultCompetenceTree = require('./build-result-competence-tree');

module.exports = function buildCertification({
  id = 1,
  assessmentResults = [buildAssessmentResult()],
  assessmentState = 'completed',
  birthdate = new Date('1992-06-12'),
  certificationCenter = 'L’univeristé du Pix',
  date = new Date('2018-12-01'),
  firstName = 'Jean',
  isPublished = true,
  lastName = 'Bon',
  userId = 1,
  // set to overried computed properties
  commentForCandidate,
  pixScore,
  status,

  // the id of the ResultCompetenceTree should be with the most recent assessment result.
  resultCompetenceTree = buildResultCompetenceTree({ id: `${id}-${assessmentResults[0].id}` }),
} = {}) {

  const certification = new Certification({
    id,
    assessmentState,
    assessmentResults,
    birthdate,
    certificationCenter,
    date,
    firstName,
    isPublished,
    lastName,
    userId,
    resultCompetenceTree,
  });

  if (pixScore !== undefined) {
    certification.pixScore = pixScore;
  }
  if (status !== undefined) {
    certification.status = status;
  }
  if (commentForCandidate !== undefined) {
    certification.commentForCandidate = commentForCandidate;
  }
  if (commentForCandidate !== undefined) {
    certification.commentForCandidate = commentForCandidate;
  }

  return certification;
};
