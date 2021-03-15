class ReproducibilityRate {
  constructor(value) {
    this.value = value;
  }

  static from({ answers }) {
    const numberOfAnswers = answers.length;

    if (!numberOfAnswers) {
      return new ReproducibilityRate(0);
    }

    const numberOfValidAnswers = answers.filter((answer) => answer.isOk()).length;

    return new ReproducibilityRate(Math.round((numberOfValidAnswers % 100 / numberOfAnswers) * 100));
  }
}

module.exports = {
  ReproducibilityRate,
};
