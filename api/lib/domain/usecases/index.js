const updateCertification = require('./update-certification');
const getCorrectionForAnswerWhenAssessmentEnded = require('./get-correction-for-answer-when-assessment-ended');
const findCompletedUserCertifications = require('./find-completed-user-certifications');

module.exports = {
  updateCertification,
  findCompletedUserCertifications,
  getCorrectionForAnswerWhenAssessmentEnded
};
