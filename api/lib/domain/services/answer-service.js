const _ = require('lodash');

module.exports = {
  getAnswersSuccessRate: (answers) => {

    const countOfAnswers = answers.length;

    if(countOfAnswers === 0) {
      return null;
    }

    const countOfValidAnswers = _(answers).filter(answer => answer.get('result') === 'ok').size();
    return (countOfValidAnswers % 100 / countOfAnswers) * 100;
  }
};
