const Certification = require('../../lib/domain/models/Certification');
const buildAssessementResult = require('./build-assessment-result');
const buildCertifiedProfile = require('./build-certifiedProfile');

module.exports = function buildCertification({
  id = 1,
  assessmentResults = [buildAssessementResult()],
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
  certifiedProfile = buildCertifiedProfile({}),
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
    certifiedProfile,
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
