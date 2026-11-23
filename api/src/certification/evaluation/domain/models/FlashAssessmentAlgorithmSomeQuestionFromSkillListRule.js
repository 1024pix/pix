import { logger } from '../../../../shared/infrastructure/utils/logger.js';

export class FlashAssessmentAlgorithmSomeQuestionFromSkillListRule {
  static isApplicable({ questionNumberToPickFromSkillList }) {
    return !!questionNumberToPickFromSkillList;
  }

  static execute({ assessmentAnswers, availableChallenges, skills, questionNumberToPickFromSkillList }) {
    if (!questionNumberToPickFromSkillList.includes(assessmentAnswers.length + 1)) return availableChallenges;

    const filteredChallenges = availableChallenges.filter(filterBySkills(skills));
    if (filteredChallenges.length === 0) {
      logger.warn('No challenge found in skill list. Fallback to all available challenges.');
      return availableChallenges;
    }
    return filteredChallenges;
  }
}

function filterBySkills(skills) {
  return (challenge) => skills.map((skill) => skill.id).includes(challenge.skill.id);
}
