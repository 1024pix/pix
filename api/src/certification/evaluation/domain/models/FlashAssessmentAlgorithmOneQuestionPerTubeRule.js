export class FlashAssessmentAlgorithmOneQuestionPerTubeRule {
  static isApplicable({ limitToOneQuestionPerTube }) {
    return limitToOneQuestionPerTube;
  }

  static execute({ assessmentAnswers, allChallenges, availableChallenges }) {
    const alreadyAnsweredTubeIds = assessmentAnswers.map(
      (answer) =>
        FlashAssessmentAlgorithmOneQuestionPerTubeRule._findChallengeForAnswer(allChallenges, answer).skill.tubeId,
    );

    return availableChallenges.filter((challenge) => isNonAnsweredTube(alreadyAnsweredTubeIds, challenge.skill));
  }

  static _findChallengeForAnswer(challenges, answer) {
    return challenges.find((challenge) => challenge.id === answer.challengeId);
  }
}

function isNonAnsweredTube(alreadyAnsweredTubeIds, skill) {
  return !alreadyAnsweredTubeIds.includes(skill.tubeId);
}
