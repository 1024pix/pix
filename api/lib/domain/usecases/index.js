const updateCertification = require('./update-certification');
const getCorrectionForAnswerWhenAssessmentEnded = require('./get-correction-for-answer-when-assessment-ended');
const getNextChallengeForPreview = require('./get-next-challenge-for-preview');
const findCompletedUserCertifications = require('./find-completed-user-certifications');

module.exports = {
  updateCertification,
  findCompletedUserCertifications,
  getCorrectionForAnswerWhenAssessmentEnded,
  getNextChallengeForPreview
};
