import _ from 'lodash';
const qrocmDepChallenge = 'QROCM-dep';

export default class AnswerCollectionForScoring {
  constructor(challengesWithAnswers) {
    this.challengesWithAnswers = challengesWithAnswers;
  }

  static from({ answers, challenges }) {
    const challengesWithAnswers = challenges.map((challenge) => {
      const answer = answers.find((answer) => answer.challengeId === challenge.challengeId);

      return new ChallengeWithAnswer(answer, challenge);
    });

    return new AnswerCollectionForScoring(challengesWithAnswers);
  }

  numberOfChallenges() {
    return this.challengesWithAnswers.length;
  }

  numberOfCorrectAnswers() {
    let nbOfCorrectAnswers = 0;
    this.challengesWithAnswers.forEach((challengeWithAnswer) => {
      if (!challengeWithAnswer.isNeutralized() && challengeWithAnswer.isCorrect()) {
        nbOfCorrectAnswers++;
      }
    });

    return nbOfCorrectAnswers;
  }

  numberOfNonNeutralizedChallenges() {
    let numberOfNonNeutralizedChallenges = 0;
    this.challengesWithAnswers.forEach((challengeWithAnswer) => {
      if (!challengeWithAnswer.isNeutralized() && challengeWithAnswer.isAnswered()) {
        numberOfNonNeutralizedChallenges++;
      }
    });

    return numberOfNonNeutralizedChallenges;
  }

  numberOfChallengesForCompetence(competenceId) {
    const challengesForCompetence = this.challengesWithAnswers.filter(
      (challengeWithAnswer) => challengeWithAnswer.competenceId() === competenceId
    );
    const numberOfChallenges = _(challengesForCompetence)
      .map((challenge) => {
        if (challengesForCompetence.length < 3 && challenge.isQROCMdep()) {
          return 2;
        } else {
          return 1;
        }
      })
      .sum();
    return numberOfChallenges;
  }

  numberOfCorrectAnswersForCompetence(competenceId) {
    const challengesWithAnswersForCompetence = this.challengesWithAnswers.filter(
      (challengeWithAnswer) => challengeWithAnswer.competenceId() === competenceId
    );
    let nbOfCorrectAnswers = 0;
    challengesWithAnswersForCompetence.forEach((challengeWithAnswer) => {
      if (!challengeWithAnswer.isNeutralized()) {
        if (challengesWithAnswersForCompetence.length < 3 && challengeWithAnswer.isAFullyCorrectQROCMdep()) {
          nbOfCorrectAnswers += 2;
        } else if (challengesWithAnswersForCompetence.length < 3 && challengeWithAnswer.isAPartiallyCorrectQROCMdep()) {
          nbOfCorrectAnswers += 1;
        } else if (challengeWithAnswer.isCorrect()) {
          nbOfCorrectAnswers += 1;
        }
      }
    });

    return _.min([nbOfCorrectAnswers, 3]);
  }

  numberOfNeutralizedChallengesForCompetence(competenceId) {
    const answersForCompetence = this.challengesWithAnswers.filter(
      (challengeWithAnswer) => challengeWithAnswer.competenceId() === competenceId
    );
    return _(answersForCompetence)
      .map((answer) => {
        if (answer.isNeutralized()) {
          if (answersForCompetence.length < 3 && answer.isQROCMdep()) {
            return 2;
          } else {
            return 1;
          }
        } else {
          return 0;
        }
      })
      .sum();
  }
}

class ChallengeWithAnswer {
  constructor(answer, challenge) {
    this._answer = answer;
    this._challenge = challenge;
  }

  isAnswered() {
    return this._answer || this._challenge.hasBeenSkippedAutomatically;
  }

  isQROCMdep() {
    const challengeType = this._challenge ? this._challenge.type : '';
    return challengeType === qrocmDepChallenge;
  }

  isCorrect() {
    return Boolean(this._answer?.isOk());
  }

  isAFullyCorrectQROCMdep() {
    return this.isQROCMdep() && this.isCorrect();
  }

  isAPartiallyCorrectQROCMdep() {
    return this.isQROCMdep() && Boolean(this._answer) && this._answer.isPartially();
  }

  isNeutralized() {
    return this._challenge.isNeutralized;
  }

  competenceId() {
    return this._challenge.competenceId;
  }
}
