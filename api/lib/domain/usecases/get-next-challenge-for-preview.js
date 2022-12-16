const { AssessmentEndedError } = require('../errors');

module.exports = function getNextChallengeForPreview() {
  return Promise.reject(new AssessmentEndedError());
};
