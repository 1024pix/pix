import lodash from 'lodash';

export class FlashAssessmentAlgorithmPassageByAllCompetencesRule {
  static isApplicable({ answers, enablePassageByAllCompetences, warmUpLength }) {
    return enablePassageByAllCompetences && answers.length >= warmUpLength;
  }

  static execute({ allChallenges, allAnswers, availableChallenges, warmUpLength }) {
    const answersAfterWarmup = this._getAnswersAfterWarmup({ allAnswers, warmUpLength });

    return this._filterAlreadyAnsweredCompetences({
      allAnswers: answersAfterWarmup,
      availableChallenges,
      allChallenges,
    });
  }

  static _getAnswersAfterWarmup({ allAnswers, warmUpLength }) {
    return allAnswers.slice(warmUpLength);
  }

  static _filterAlreadyAnsweredCompetences({ allAnswers, allChallenges, availableChallenges }) {
    const answeredCompetenceIds = allAnswers.map(
      ({ challengeId }) => lodash.find(allChallenges, { id: challengeId }).competenceId,
    );

    const remainingChallenges = allChallenges.filter(
      (challenge) => !answeredCompetenceIds.includes(challenge.competenceId),
    );

    if (remainingChallenges.length === 0) return availableChallenges;

    return remainingChallenges;
  }
}
