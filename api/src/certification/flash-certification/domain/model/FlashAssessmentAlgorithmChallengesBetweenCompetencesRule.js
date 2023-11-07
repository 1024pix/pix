export class FlashAssessmentAlgorithmChallengesBetweenCompetencesRule {
  static isApplicable({ challengesBetweenSameCompetence }) {
    return challengesBetweenSameCompetence > 0;
  }

  static execute({ allChallenges, allAnswers, availableChallenges, challengesBetweenSameCompetence }) {
    const lastCompetenceIds = FlashAssessmentAlgorithmChallengesBetweenCompetencesRule._getLastAnswersCompetenceIds(
      allAnswers,
      allChallenges,
      challengesBetweenSameCompetence,
    );

    const challengesWithNoRecentlyAnsweredCompetence = availableChallenges.filter(
      ({ competenceId }) => !lastCompetenceIds.includes(competenceId),
    );

    return challengesWithNoRecentlyAnsweredCompetence.length > 0
      ? challengesWithNoRecentlyAnsweredCompetence
      : availableChallenges;
  }

  static _getLastAnswersCompetenceIds(allAnswers, allChallenges, numberOfAnswers) {
    const lastAnswers = allAnswers.slice(-numberOfAnswers);
    const competenceIds = lastAnswers.map((answer) => {
      const challenge = FlashAssessmentAlgorithmChallengesBetweenCompetencesRule._findChallengeForAnswer(
        allChallenges,
        answer,
      );
      return challenge.competenceId;
    });

    return competenceIds;
  }

  static _findChallengeForAnswer(challenges, answer) {
    return challenges.find((challenge) => challenge.id === answer.challengeId);
  }
}
