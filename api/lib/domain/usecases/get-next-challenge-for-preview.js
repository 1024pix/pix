const { AssessmentEndedError } = require('../errors');

module.exports = function() {

  return Promise.reject(new AssessmentEndedError());

};
