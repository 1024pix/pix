import { logger } from '../../../../shared/infrastructure/utils/logger.js';

export class FlashAssessmentAlgorithmChallengesBetweenCompetencesRule {
  static isApplicable({ challengesBetweenSameCompetence }) {
    return challengesBetweenSameCompetence > 0;
  }

  static execute({ allChallenges, assessmentAnswers, availableChallenges, challengesBetweenSameCompetence }) {
    const lastCompetenceIds = FlashAssessmentAlgorithmChallengesBetweenCompetencesRule._getLastAnswersCompetenceIds(
      assessmentAnswers,
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

  static _getLastAnswersCompetenceIds(assessmentAnswers, allChallenges, numberOfAnswers) {
    const lastAnswers = assessmentAnswers.slice(-numberOfAnswers);
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
    const challengeAssociatedToAnswer = challenges.find((challenge) => challenge.id === answer.challengeId);
    if (!challengeAssociatedToAnswer) {
      logger.warn({ answer }, 'Cannot find a challenge associated to answer.challengeId');
    }
    return challengeAssociatedToAnswer;
  }
}
