const _ = require('lodash');
const SKILL_REVIEW_ID_PREFIX = 'skill-review-';

/*
 * Traduction : Profil d'avancement
 */
class SkillReview {

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

  get profileMasteryRate() {
    const numberOfTargetedSkills = this.targetedSkills.length;

    const validatedSkillsThatExistsInTargetedSkills = _.intersectionBy(this.targetedSkills, this._getValidatedSkills(), 'name');
    const numberOfValidatedSkills = validatedSkillsThatExistsInTargetedSkills.length;

    return numberOfValidatedSkills / numberOfTargetedSkills;
  }

  get profileCompletionRate() {
    if(this.isProfileCompleted) {
      return 1;
    }

    const numberOfTargetedSkills = this.targetedSkills.length;

    const testedSkillsInTargetProfile =  this.knowledgeElements
      .filter((knowledgeElement) => this.targetedSkills.find((targetedSkill) => targetedSkill.id === knowledgeElement.skillId));

    return testedSkillsInTargetProfile.length / numberOfTargetedSkills;
  }

  static generateIdFromAssessmentId(assessmentId) {
    return `${SKILL_REVIEW_ID_PREFIX}${assessmentId}`;
  }

  static getAssessmentIdFromId(skillReviewId) {
    return parseInt(skillReviewId.replace(SKILL_REVIEW_ID_PREFIX, ''), 10);
  }
}

module.exports = SkillReview;

