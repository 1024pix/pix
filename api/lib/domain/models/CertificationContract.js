const { CertificationComputeError } = require('../../../lib/domain/errors');
const _ = require('lodash');

class CertificationContract {

  /* PUBLIC INTERFACE */
  static assertThatCompetenceHasAtLeastOneChallenge(challengesForCompetence, competenceIndex) {
    if (challengesForCompetence.length === 0) {
      throw new CertificationComputeError('Pas assez de challenges posés pour la compétence ' + competenceIndex);
    }
  }

  static assertThatCompetenceHasAtLeastOneAnswer(answerForCompetence, competenceIndex) {
    if (answerForCompetence.length === 0) {
      throw new CertificationComputeError('Pas assez de réponses pour la compétence ' + competenceIndex);
    }
  }

  static assertThatScoreIsCoherentWithReproducibilityRate(scoreAfterRating, reproducibilityRate) {
    if (scoreAfterRating < 1 && reproducibilityRate > 50) {
      throw new CertificationComputeError('Rejeté avec un taux de reproductibilité supérieur à 50');
    }
  }

  static assertThatEveryAnswerHasMatchingChallenge(answersForCompetence, challengesForCompetence) {
    answersForCompetence.forEach((answer) => {
      const challenge = _.find(challengesForCompetence, { challengeId: answer.challengeId });
      if (!challenge) {
        throw new CertificationComputeError('Problème de chargement du challenge ' + answer.challengeId);
      }
    });
  }

  static assertThatNoChallengeHasMoreThanOneAnswer(answersForCompetence) {
    const someChallengesHaveMoreThanOneAnswer = _(answersForCompetence)
      .groupBy((answer) => answer.challengeId)
      .some((answerGroup) => answerGroup.length > 1);

    if (someChallengesHaveMoreThanOneAnswer) {
      throw new CertificationComputeError('Plusieurs réponses pour une même épreuve');
    }
  }
}

module.exports = CertificationContract;
