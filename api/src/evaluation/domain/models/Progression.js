import _ from 'lodash';
const PROGRESSION_ID_PREFIX = 'progression-';

const ONE_HUNDRED_PERCENT = 1;

/*
 * Traduction : Profil d'avancement
 */
class Progression {
  constructor({ id, skillIds = [], knowledgeElements = [], isProfileCompleted = false }) {
    this.id = id;
    this.knowledgeElements = knowledgeElements;
    this.skillIds = skillIds;
    this.targetedKnowledgeElements = _.filter(knowledgeElements, (ke) => _.includes(this.skillIds, ke.skillId));
    this.isProfileCompleted = isProfileCompleted;
  }

  _getTargetedSkillsAlreadyTestedCount() {
    return this.targetedKnowledgeElements.length;
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
