const _ = require('../../infrastructure/utils/lodash-utils.js');

const AnswerStatus = require('../models/AnswerStatus.js');

module.exports = {
  match(answer, solution) {
    if (_.areCSVequivalent(answer, solution)) {
      return AnswerStatus.OK;
    }
    return AnswerStatus.KO;
  },
};
