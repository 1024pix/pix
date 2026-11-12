import { CertificationComputeError } from '../errors.js';

export class CertificationContract {
  static assertThatWeHaveEnoughAnswers(listAnswers, listChallenges) {
    const answeredChallengeIds = new Set(listAnswers.map(({ challengeId }) => challengeId));
    const someUnansweredChallenges = listChallenges.some((challenge) => {
      return (
        !challenge.hasBeenSkippedAutomatically &&
        !challenge.isNeutralized &&
        !answeredChallengeIds.has(challenge.challengeId)
      );
    });

    if (someUnansweredChallenges) {
      throw new CertificationComputeError(
        "L’utilisateur n’a pas répondu à toutes les questions, alors qu'aucune raison d'abandon n'a été fournie.",
      );
    }
  }

  static assertThatCompetenceHasAtLeastOneChallenge(challengesForCompetence, competenceIndex) {
    if (challengesForCompetence.length === 0) {
      throw new CertificationComputeError('Pas assez de challenges posés pour la compétence ' + competenceIndex);
    }
  }

  static assertThatScoreIsCoherentWithReproducibilityRate(scoreAfterRating, reproducibilityRate) {
    if (scoreAfterRating < 1 && reproducibilityRate > 50) {
      throw new CertificationComputeError('Rejeté avec un taux de reproductibilité supérieur à 50');
    }
  }

  static assertThatEveryAnswerHasMatchingChallenge(answersForCompetence, challengesForCompetence) {
    const challengeIdsForCompetence = new Set(challengesForCompetence.map(({ challengeId }) => challengeId));
    answersForCompetence.forEach((answer) => {
      if (!challengeIdsForCompetence.has(answer.challengeId)) {
        throw new CertificationComputeError('Problème de chargement du challenge ' + answer.challengeId);
      }
    });
  }

  static assertThatNoChallengeHasMoreThanOneAnswer(answersForCompetence) {
    const seenIds = new Set();
    for (const answer of answersForCompetence) {
      if (seenIds.has(answer.challengeId)) {
        throw new CertificationComputeError('Plusieurs réponses pour une même épreuve');
      }
      seenIds.add(answer.challengeId);
    }
  }

  static hasEnoughNonNeutralizedChallengesToBeTrusted(numberOfChallenges, numberOfNonNeutralizedChallenges) {
    const minimalNumberOfNonNeutralizedChallengesToBeTrusted = Math.ceil(numberOfChallenges * 0.66);
    return numberOfNonNeutralizedChallenges >= minimalNumberOfNonNeutralizedChallengesToBeTrusted;
  }
}
