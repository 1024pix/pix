import lodash from 'lodash';

export class FlashAssessmentAlgorithmPassageByAllCompetencesRule {
  static isApplicable({ answers, enablePassageByAllCompetences, warmUpLength }) {
    return enablePassageByAllCompetences && answers.length >= warmUpLength;
  }

  static execute({ allChallenges, assessmentAnswers, availableChallenges, warmUpLength }) {
    const answersAfterWarmup = this._getAnswersAfterWarmup({ assessmentAnswers, warmUpLength });

    return this._filterAlreadyAnsweredCompetences({
      assessmentAnswers: answersAfterWarmup,
      availableChallenges,
      allChallenges,
    });
  }

  static _getAnswersAfterWarmup({ assessmentAnswers, warmUpLength }) {
    return assessmentAnswers.slice(warmUpLength);
  }

  static _filterAlreadyAnsweredCompetences({ assessmentAnswers, allChallenges, availableChallenges }) {
    const answeredCompetenceIds = assessmentAnswers.map(
      ({ challengeId }) => lodash.find(allChallenges, { id: challengeId }).competenceId,
    );

    const remainingChallenges = allChallenges.filter(
      (challenge) => !answeredCompetenceIds.includes(challenge.competenceId),
    );

    if (remainingChallenges.length === 0) return availableChallenges;

    return remainingChallenges;
  }
}
