const PROGRESSION_ID_PREFIX = 'progression-';

const ONE_HUNDRED_PERCENT = 1;

/*
 * Traduction : Profil d'avancement
 */
class Progression {
  constructor({ id, skillIds = [], knowledgeState, isProfileCompleted = false }) {
    this.id = id;
    this.skillIds = skillIds;
    const assessedSkillIds = new Set(knowledgeState?.assessedSkills().map(({ id: skillId }) => skillId) ?? []);
    this.targetedAssessedSkillIds = skillIds.filter((skillId) => assessedSkillIds.has(skillId));
    this.isProfileCompleted = isProfileCompleted;
  }

  _getTargetedSkillsAlreadyTestedCount() {
    return this.targetedAssessedSkillIds.length;
  }

  _getTargetedSkillsCount() {
    return this.skillIds.length;
  }

  get completionRate() {
    return this.isProfileCompleted
      ? ONE_HUNDRED_PERCENT
      : this._getTargetedSkillsAlreadyTestedCount() / this._getTargetedSkillsCount();
  }

  static generateIdFromAssessmentId(assessmentId) {
    return `${PROGRESSION_ID_PREFIX}${assessmentId}`;
  }

  static getAssessmentIdFromId(progressionId) {
    return parseInt(progressionId.replace(PROGRESSION_ID_PREFIX, ''), 10);
  }
}

export { Progression };
