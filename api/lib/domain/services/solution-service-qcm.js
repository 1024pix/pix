const _ = require('../../infrastructure/utils/lodash-utils');

const AnswerStatus = require('../models/AnswerStatus');

module.exports = {

  match(answer, solution) {

    if (_.areCSVequivalent(answer, solution)) {
      return AnswerStatus.OK;
    }
    return AnswerStatus.KO;
  }

};
