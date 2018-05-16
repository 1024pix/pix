const Certification = require('../../lib/domain/models/Certification');
const buildAssessementResult = require('./build-assessment-result');

module.exports = function({
  id = 1,
  date = '2018-12-01',
  certificationCenter = 'L’univeristé du Pix',
  isPublished = true,
  assessmentState = 'completed',
  assessmentResults = [buildAssessementResult()],
  // set to overried computed properties
  pixScore,
  status,
  commentForCandidate,
} = {}) {

  const certification = new Certification({
    id,
    date,
    certificationCenter,
    isPublished,
    assessmentState,
    assessmentResults,
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

  return certification;
};

