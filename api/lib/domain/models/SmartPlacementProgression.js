const _ = require('lodash');
const SMART_PLACEMENT_PROGRESSION_ID_PREFIX = 'smart-placement-progression-';

const ONE_HUNDRED_PERCENT = 1;

/*
 * Traduction : Profil d'avancement
 */
class SmartPlacementProgression {

  constructor({
    id,
    // attributes
    // includes
    targetedSkills = [],
    knowledgeElements = [],
    isProfileCompleted = false,
    // references
  }) {
    this.id = id;
    // attributes
    // includes
    this.knowledgeElements = knowledgeElements;
    this.targetedSkills = targetedSkills;
    this.targetedSkillsIds = _.map(targetedSkills, 'id');
    this.targetedKnowledgeElements = _.filter(knowledgeElements, (ke) => _.includes(this.targetedSkillsIds, ke.skillId));
    this.isProfileCompleted = isProfileCompleted;
    // references
  }

  _getTargetedSkillsValidatedCount() {
    return _(this.targetedKnowledgeElements).filter('isValidated').value().length;
  }

  _getTargetedSkillsAlreadyTestedCount() {
    return this.targetedKnowledgeElements.length;
  }

  _getTargetedSkillsCount() {
    return this.targetedSkillsIds.length;
  }

  get validationRate() {
    return this._getTargetedSkillsValidatedCount() / this._getTargetedSkillsCount();
  }

  get completionRate() {
    return this.isProfileCompleted
      ? ONE_HUNDRED_PERCENT
      : this._getTargetedSkillsAlreadyTestedCount() / this._getTargetedSkillsCount();
  }

  static generateIdFromAssessmentId(assessmentId) {
    return `${SMART_PLACEMENT_PROGRESSION_ID_PREFIX}${assessmentId}`;
  }

  static getAssessmentIdFromId(smartPlacementProgressionId) {
    return parseInt(smartPlacementProgressionId.replace(SMART_PLACEMENT_PROGRESSION_ID_PREFIX, ''), 10);
  }
}

module.exports = SmartPlacementProgression;

