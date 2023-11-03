export class FlashAssessmentAlgorithmOneQuestionPerTubeRule {
  static isApplicable({ limitToOneQuestionPerTube }) {
    return limitToOneQuestionPerTube;
  }

  static execute({ allAnswers, allChallenges, availableChallenges }) {
    const alreadyAnsweredTubeIds = allAnswers.map(
      (answer) =>
        FlashAssessmentAlgorithmOneQuestionPerTubeRule._findChallengeForAnswer(allChallenges, answer).skill.tubeId,
    );

    const isNonAnsweredTube = (skill) => !alreadyAnsweredTubeIds.includes(skill.tubeId);
    return availableChallenges.filter((challenge) => isNonAnsweredTube(challenge.skill));
  }

  static _findChallengeForAnswer(challenges, answer) {
    return challenges.find((challenge) => challenge.id === answer.challengeId);
  }
}
