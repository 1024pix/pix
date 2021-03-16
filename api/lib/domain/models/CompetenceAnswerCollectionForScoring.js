const _ = require('lodash');
const qrocmDepChallenge = 'QROCM-dep';

// TODO : find a better name ? CompetenceAnswerSheet ?
module.exports = class CompetenceAnswerCollection {
  constructor(answers) {
    this.answers = answers;
  }

  static from({ answersForCompetence, challengesForCompetence }) {
    const answersForScoring = answersForCompetence.map((answer) => {
      const challenge = _.find(challengesForCompetence, { challengeId: answer.challengeId });
      return new AnswerForScoring(answer, challenge);
    });
    return new CompetenceAnswerCollection(answersForScoring);
  }

  numberOfCorrectAnswers() {
    let nbOfCorrectAnswers = 0;
    this.answers.forEach((answer) => {
      if (this.answers.length < 3 && answer.isAFullyCorrectQROCMdep()) { // TODO : remove (useless) check on length ?
        nbOfCorrectAnswers += 2;
      } else if (this.answers.length < 3 && answer.isAPartiallyCorrectQROCMdep()) { // TODO : remove (useless) check on length ?
        nbOfCorrectAnswers += 1;
      } else if (answer.isCorrect()) {
        nbOfCorrectAnswers += 1;
      }
    });

    return nbOfCorrectAnswers;
  }

  numberOfChallengesAnswered() {
    const numberOfChallenges = _(this.answers).map((answer) => {
      if (this.answers.length < 3 && answer.isQROCMdep()) {
        return 2;
      } else {
        return 1;
      }
    }).sum();
    return numberOfChallenges;
  }

  numberOfNeutralizedChallenges() {
    return this.answers.filter((answer) => answer.challenge.isNeutralized).length;
  }
};

class AnswerForScoring {
  constructor(answer, challenge) {
    this.answer = answer;
    this.challenge = challenge;
  }

  isQROCMdep() {
    const challengeType = this.challenge ? this.challenge.type : '';
    return challengeType === qrocmDepChallenge;
  }

  isCorrect() {
    return this.answer.isOk();
  }

  isAFullyCorrectQROCMdep() {
    return this.isQROCMdep() && this.answer.isOk();
  }

  isAPartiallyCorrectQROCMdep() {
    return this.isQROCMdep() && this.answer.isPartially();
  }
}
