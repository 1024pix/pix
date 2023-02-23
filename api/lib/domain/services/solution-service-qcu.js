const AnswerStatus = require('../models/AnswerStatus.js');

module.exports = {
  match(answer, solution) {
    if (answer === solution) {
      return AnswerStatus.OK;
    }
    return AnswerStatus.KO;
  },
};
