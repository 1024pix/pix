const _ = require('lodash');
const AnswerStatus = require('../models/AnswerStatus');

module.exports = {
  getAnswersSuccessRate: (answers) => {

    const countOfAnswers = answers.length;

    if(countOfAnswers === 0) {
      return null;
    }

    const countOfValidAnswers = _(answers).filter(answer => AnswerStatus.isOK(answer.get('result'))).size();
    return (countOfValidAnswers % 100 / countOfAnswers) * 100;
  }
};
