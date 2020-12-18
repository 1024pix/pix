const _ = require('lodash');
const PROGRESSION_ID_PREFIX = 'progression-';

const ONE_HUNDRED_PERCENT = 1;

/*
 * Traduction : Profil d'avancement
 */
class Progression {

  constructor({
    id,
    targetedSkills = [],
    knowledgeElements = [],
    isProfileCompleted = false,
  }) {
    this.id = id;
    this.knowledgeElements = knowledgeElements;
    this.targetedSkills = targetedSkills;
    this.targetedSkillsIds = _.map(targetedSkills, 'id');
    this.targetedKnowledgeElements = _.filter(knowledgeElements, (ke) => _.includes(this.targetedSkillsIds, ke.skillId));
    this.isProfileCompleted = isProfileCompleted;
  }

  _getTargetedSkillsAlreadyTestedCount() {
    return this.targetedKnowledgeElements.length;
  }

  _getTargetedSkillsCount() {
    return this.targetedSkillsIds.length;
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

module.exports = Progression;

