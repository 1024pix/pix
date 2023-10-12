export class FlashAssessmentAlgorithmOneQuestionPerTubeRule {
  static isApplicable({ limitToOneQuestionPerTube }) {
    return limitToOneQuestionPerTube;
  }

  static execute({ allAnswers, challenges }) {
    const alreadyAnsweredTubeIds = allAnswers.map(
      (answer) =>
        FlashAssessmentAlgorithmOneQuestionPerTubeRule._findChallengeForAnswer(challenges, answer).skill.tubeId,
    );

    const isNonAnsweredTube = (skill) => !alreadyAnsweredTubeIds.includes(skill.tubeId);
    return challenges.filter((challenge) => isNonAnsweredTube(challenge.skill));
  }

  static _findChallengeForAnswer(challenges, answer) {
    return challenges.find((challenge) => challenge.id === answer.challengeId);
  }
}
