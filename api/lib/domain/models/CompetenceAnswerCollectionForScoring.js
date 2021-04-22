const _ = require('lodash');
const qrocmDepChallenge = 'QROCM-dep';

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

  numberOfNeutralizedChallenges() {
    return _(this.answers).map((answer) => {
      if (answer.isNeutralized()) {
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
    return Boolean(this.answer?.isOk());
  }

  isAFullyCorrectQROCMdep() {
    return this.isQROCMdep() && this.isCorrect();
  }

  isAPartiallyCorrectQROCMdep() {
    return this.isQROCMdep()
      && Boolean(this.answer) && this.answer.isPartially();
  }

  isNeutralized() {
    return this.challenge.isNeutralized;
  }
}
