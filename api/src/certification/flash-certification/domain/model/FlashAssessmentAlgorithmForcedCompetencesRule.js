import lodash from 'lodash';

export class FlashAssessmentAlgorithmForcedCompetencesRule {
  static isApplicable({ answers, forcedCompetences, warmUpLength }) {
    return forcedCompetences.length > 0 && answers.length >= warmUpLength;
  }

  static execute({ allChallenges, assessmentAnswers, availableChallenges, warmUpLength, forcedCompetences }) {
    const answersAfterWarmup = this._getAnswersAfterWarmup({ assessmentAnswers, warmUpLength });

    return this._filterAlreadyAnsweredCompetences({
      assessmentAnswers: answersAfterWarmup,
      availableChallenges,
      allChallenges,
      forcedCompetences,
    });
  }

  static _getAnswersAfterWarmup({ assessmentAnswers, warmUpLength }) {
    return assessmentAnswers.slice(warmUpLength);
  }

  static _filterAlreadyAnsweredCompetences({
    assessmentAnswers,
    allChallenges,
    forcedCompetences,
    availableChallenges,
  }) {
    const answeredCompetenceIds = assessmentAnswers.map(
      ({ challengeId }) => lodash.find(allChallenges, { id: challengeId }).competenceId,
    );

    const remainingCompetenceIds = forcedCompetences.filter(
      (competenceId) => !answeredCompetenceIds.includes(competenceId),
    );

    const allCompetencesAreAnswered = remainingCompetenceIds.length === 0;

    if (allCompetencesAreAnswered) {
      return availableChallenges;
    }
    return availableChallenges.filter(({ competenceId }) => remainingCompetenceIds.includes(competenceId));
  }
}
