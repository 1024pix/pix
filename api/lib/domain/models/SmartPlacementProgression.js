const _ = require('lodash');
const SMART_PLACEMENT_PROGRESSION_ID_PREFIX = 'smart-placement-progression-';

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
    this.targetedSkills = targetedSkills;
    this.knowledgeElements = knowledgeElements;
    this.isProfileCompleted = isProfileCompleted;
    // references
  }

  _getValidatedSkills() {
    return this.knowledgeElements
      .filter((knowledgeElement) => knowledgeElement.isValidated)
      .map((knowledgeElement) => knowledgeElement.skillId)
      .map((skillId) => this.targetedSkills.find((skill) => skill.id === skillId));
  }

  get masteryRate() {
    const numberOfTargetedSkills = this.targetedSkills.length;

    const validatedSkillsThatExistsInTargetedSkills = _.intersectionBy(this.targetedSkills, this._getValidatedSkills(), 'name');
    const numberOfValidatedSkills = validatedSkillsThatExistsInTargetedSkills.length;

    return numberOfValidatedSkills / numberOfTargetedSkills;
  }

  get completionRate() {
    if(this.isProfileCompleted) {
      return 1;
    }

    const numberOfTargetedSkills = this.targetedSkills.length;

    const testedSkillsInTargetProfile =  this.knowledgeElements
      .filter((knowledgeElement) => this.targetedSkills.find((targetedSkill) => targetedSkill.id === knowledgeElement.skillId));

    return testedSkillsInTargetProfile.length / numberOfTargetedSkills;
  }

  static generateIdFromAssessmentId(assessmentId) {
    return `${SMART_PLACEMENT_PROGRESSION_ID_PREFIX}${assessmentId}`;
  }

  static getAssessmentIdFromId(smartPlacementProgressionId) {
    return parseInt(smartPlacementProgressionId.replace(SMART_PLACEMENT_PROGRESSION_ID_PREFIX, ''), 10);
  }
}

module.exports = SmartPlacementProgression;

