const { CertificationComputeError } = require('../../../lib/domain/errors');

class CertificationRules {
  constructor() {
  }

  /* PUBLIC INTERFACE */
  static assertThatWeHaveEnoughAnswers(listAnswers, listChallenges) {
    if (listAnswers.length < listChallenges.length) {
      throw new CertificationComputeError('L’utilisateur n’a pas répondu à toutes les questions');
    }
  }

  static assertThatWeAskAtLeastTwoChallengesByCompetence(challengesForCompetence, competenceIndex) {
    if (challengesForCompetence.length < 2) {
      throw new CertificationComputeError('Pas assez de challenges posés pour la compétence ' + competenceIndex);
    }
  }

  static assertThatWeHaveAtLeastTwoAnswersByCompetence(answerForCompetence, competenceIndex) {
    if (answerForCompetence.length < 2) {
      throw new CertificationComputeError('Pas assez de réponses pour la compétence ' + competenceIndex);
    }
  }

  static assertThatScoreIsPositifWhenRepoductibilityRateIsMoreThan50(scoreAfterRating, reproductibilityRate) {
    if (scoreAfterRating < 1 && reproductibilityRate > 50) {
      throw new CertificationComputeError('Rejeté avec un taux de reproductibilité supérieur à 50');
    }
  }
}

module.exports = CertificationRules;
