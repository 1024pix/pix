const { CertificationComputeError } = require('../../../lib/domain/errors');
const _ = require('lodash');

class CertificationContract {

  /* PUBLIC INTERFACE */
  static assertThatWeHaveEnoughAnswers(listAnswers, listChallenges) {
    if (listAnswers.length < listChallenges.length) {
      throw new CertificationComputeError('L’utilisateur n’a pas répondu à toutes les questions');
    }
  }

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
}

module.exports = CertificationContract;
