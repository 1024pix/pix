import { logger } from '../../../../shared/infrastructure/utils/logger.js';

export class FlashAssessmentAlgorithmNonAnsweredSkillsRule {
  static isApplicable({ limitToOneQuestionPerTube }) {
    return !limitToOneQuestionPerTube;
  }

  static execute({ assessmentAnswers, allChallenges, availableChallenges }) {
    const alreadyAnsweredSkillsIds = assessmentAnswers
      .map((answer) => this._findChallengeForAnswer(allChallenges, answer))
      .map((challenge) => challenge.skill.id);

    const isNonAnsweredSkill = (skill) => !alreadyAnsweredSkillsIds.includes(skill.id);
    const challengesForNonAnsweredSkills = availableChallenges.filter((challenge) =>
      isNonAnsweredSkill(challenge.skill),
    );

    return challengesForNonAnsweredSkills;
  }

  static _findChallengeForAnswer(challenges, answer) {
    const challengeAssociatedToAnswer = challenges.find((challenge) => challenge.id === answer.challengeId);
    if (!challengeAssociatedToAnswer) {
      logger.warn({ answer }, 'Cannot find a challenge associated to answer.challengeId');
    }
    return challengeAssociatedToAnswer;
  }
}
