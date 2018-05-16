const Certification = require('../../lib/domain/models/Certification');
const buildAssessementResult = require('./build-assessment-result');

module.exports = function({
  id = 1,
  assessmentResults = [buildAssessementResult()],
  assessmentState = 'completed',
  certificationCenter = 'L’univeristé du Pix',
  date = '2018-12-01',
  isPublished = true,
  userId = 1,
  // set to overried computed properties
  commentForCandidate,
  pixScore,
  status,
} = {}) {

  const certification = new Certification({
    id,
    assessmentState,
    assessmentResults,
    certificationCenter,
    date,
    isPublished,
    userId,
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

