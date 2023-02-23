const { AssessmentEndedError } = require('../errors.js');

module.exports = function getNextChallengeForPreview() {
  return Promise.reject(new AssessmentEndedError());
};
