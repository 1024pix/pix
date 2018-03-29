module.exports = {

  getAnswersSuccessRate: (answers = []) => {
    const numberOfAnswers = answers.length;

    if(numberOfAnswers === 0) {
      return null;
    }

    const numberOfValidAnswers = answers.filter(answer => answer.isOk()).length;

    return (numberOfValidAnswers % 100 / numberOfAnswers) * 100;
  }
};
