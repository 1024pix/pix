const _ = require('lodash');
const qrocmDepChallenge = 'QROCM-dep';

module.exports = class AnswerCollectionForScoring {
  constructor(answers) {
    this.answers = answers;
  }

  static from({ answers, challenges }) {
    const answersForScoring = challenges.map((challenge) => {
      const answer = _.find(answers, { challengeId: challenge.challengeId });
      return new AnswerForScoring(answer, challenge);
    });
    return new AnswerCollectionForScoring(answersForScoring);
  }

  numberOfCorrectAnswers() {
    let nbOfCorrectAnswers = 0;
    this.answers.forEach((answer) => {
      if (!answer.isNeutralized() && answer.isCorrect()) {
        nbOfCorrectAnswers++;
      }
    });

    return nbOfCorrectAnswers;
  }

  numberOfNonNeutralizedChallenges() {
    let numberOfNonNeutralizedChallenges = 0;
    this.answers.forEach((answer) => {
      if (!answer.isNeutralized()) {
        numberOfNonNeutralizedChallenges++;
      }
    });

    return numberOfNonNeutralizedChallenges;
  }

  numberOfChallengesForCompetence(competenceId) {
    const answersForCompetence = this.answers.filter((answer) => answer.competenceId() === competenceId);
    const numberOfChallenges = _(answersForCompetence).map((answer) => {
      if (answersForCompetence.length < 3 && answer.isQROCMdep()) {
        return 2;
      } else {
        return 1;
      }
    }).sum();
    return numberOfChallenges;
  }

  numberOfCorrectAnswersForCompetence(competenceId) {
    const answersForCompetence = this.answers.filter((answer) => answer.competenceId() === competenceId);
    let nbOfCorrectAnswers = 0;
    answersForCompetence.forEach((answer) => {
      if (!answer.challenge.isNeutralized) {
        if (answersForCompetence.length < 3 && answer.isAFullyCorrectQROCMdep()) {
          nbOfCorrectAnswers += 2;
        } else if (answersForCompetence.length < 3 && answer.isAPartiallyCorrectQROCMdep()) {
          nbOfCorrectAnswers += 1;
        } else if (answer.isCorrect()) {
          nbOfCorrectAnswers += 1;
        }
      }
    });

    return nbOfCorrectAnswers;
  }

  /*
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
   */
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
  competenceId() {
    return this.challenge.competenceId;
  }
}
