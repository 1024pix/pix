const _ = require('lodash');
const qrocmDepChallenge = 'QROCM-dep';

// TODO : find a better name ? CompetenceAnswerSheet ?
module.exports = class CompetenceAnswerCollection {
  constructor(answers) {
    this.answers = answers;
  }

  static from({ answersForCompetence, challengesForCompetence }) {
    const answersForScoring = challengesForCompetence.map((challenge) => {
      const answer = _.find(answersForCompetence, { challengeId: challenge.challengeId });
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

  numberOfChallenges() {
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
    return _(this.answers).map((answer) => {
      if (answer.challenge.isNeutralized) {
        if (this.answers.length < 3 && answer.isQROCMdep()) {
          return 2;
        } else {
          return 1;
        }
      } else {
        return 0;
      }
    }).sum();
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
    return Boolean(this?.answer.isOk());
  }

  isAFullyCorrectQROCMdep() {
    return this.isQROCMdep() && this.isCorrect();
  }

  isAPartiallyCorrectQROCMdep() {
    return this.isQROCMdep()
      && Boolean(this.answer) && this.answer.isPartially();
  }
}
