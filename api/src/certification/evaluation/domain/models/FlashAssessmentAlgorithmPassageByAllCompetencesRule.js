export class FlashAssessmentAlgorithmPassageByAllCompetencesRule {
  static isApplicable({ enablePassageByAllCompetences }) {
    return enablePassageByAllCompetences;
  }

  static execute({ allChallenges, assessmentAnswers, availableChallenges }) {
    return this._filterAlreadyAnsweredCompetences({
      assessmentAnswers,
      availableChallenges,
      allChallenges,
    });
  }

  static _filterAlreadyAnsweredCompetences({ assessmentAnswers, allChallenges, availableChallenges }) {
    const answeredCompetenceIds = assessmentAnswers.map(
      ({ challengeId }) => allChallenges.find((challenge) => challenge.id === challengeId).skill.competenceId,
    );

    const remainingChallenges = allChallenges.filter(
      (challenge) => !answeredCompetenceIds.includes(challenge.skill.competenceId),
    );

    if (remainingChallenges.length === 0) return availableChallenges;

    return remainingChallenges;
  }
}
