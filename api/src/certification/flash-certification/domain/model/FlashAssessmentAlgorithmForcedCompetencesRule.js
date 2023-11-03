import lodash from 'lodash';

export class FlashAssessmentAlgorithmForcedCompetencesRule {
  static isApplicable({ answers, forcedCompetences, warmUpLength }) {
    return forcedCompetences.length > 0 && answers.length >= warmUpLength;
  }

  static execute({ allChallenges, allAnswers, availableChallenges, warmUpLength, forcedCompetences }) {
    const answersAfterWarmup = this._getAnswersAfterWarmup({ allAnswers, warmUpLength });

    return this._filterAlreadyAnsweredCompetences({
      allAnswers: answersAfterWarmup,
      availableChallenges,
      allChallenges,
      forcedCompetences,
    });
  }

  static _getAnswersAfterWarmup({ allAnswers, warmUpLength }) {
    return allAnswers.slice(warmUpLength);
  }

  static _filterAlreadyAnsweredCompetences({ allAnswers, allChallenges, forcedCompetences, availableChallenges }) {
    const answeredCompetenceIds = allAnswers.map(
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
