export class FlashAssessmentAlgorithmNonAnsweredSkillsRule {
  static isApplicable({ limitToOneQuestionPerTube }) {
    return !limitToOneQuestionPerTube;
  }

  static execute({ allAnswers, challenges }) {
    const alreadyAnsweredSkillsIds = allAnswers
      .map((answer) => this._findChallengeForAnswer(challenges, answer))
      .map((challenge) => challenge.skill.id);

    const isNonAnsweredSkill = (skill) => !alreadyAnsweredSkillsIds.includes(skill.id);
    const challengesForNonAnsweredSkills = challenges.filter((challenge) => isNonAnsweredSkill(challenge.skill));

    return challengesForNonAnsweredSkills;
  }

  static _findChallengeForAnswer(challenges, answer) {
    return challenges.find((challenge) => challenge.id === answer.challengeId);
  }
}
