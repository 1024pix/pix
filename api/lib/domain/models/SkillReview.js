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
    computeUnratableSkill = false,
    // references
  }) {
    this.id = id;
    // attributes
    // includes
    this.targetedSkills = targetedSkills;
    this.knowledgeElements = knowledgeElements;
    this.computeUnratableSkill = computeUnratableSkill;
    // references
  }

  _getValidatedSkills() {

    return this.knowledgeElements
      .filter((knowledgeElement) => knowledgeElement.isValidated)
      .map((knowledgeElement) => knowledgeElement.skillId)
      .map((skillId) => this.targetedSkills.find((skill) => skill.id === skillId));
  }

  _getUnratableSkills() {

    if(!this.computeUnratableSkill) {
      return [];
    }

    return this.targetedSkills.filter((skillInProfile) => {

      const foundKnowledgeElementForTheSkill = this.knowledgeElements.find((knowledgeElement) => {
        return knowledgeElement.skillId === skillInProfile.id;
      });

      return (!foundKnowledgeElementForTheSkill);
    });
  }

  get profileMasteryRate() {
    const numberOfTargetedSkills = this.targetedSkills.length;

    const validatedSkillsThatExistsInTargetedSkills = _.intersectionBy(this.targetedSkills, this._getValidatedSkills(), 'name');
    const numberOfValidatedSkills = validatedSkillsThatExistsInTargetedSkills.length;

    return numberOfValidatedSkills / numberOfTargetedSkills;
  }

  get profileCompletionRate() {
    const numberOfTargetedSkills = this.targetedSkills.length;
    const numberOfUnratableSkills = this._getUnratableSkills().length;

    const testedSkillsInTargetProfile =  this.knowledgeElements
      .filter((knowledgeElement) => this.targetedSkills.find((targetedSkill) => targetedSkill.id === knowledgeElement.skillId));

    const profileCompletionRate = (testedSkillsInTargetProfile.length + numberOfUnratableSkills) / numberOfTargetedSkills;
    return profileCompletionRate;
  }

  static generateIdFromAssessmentId(assessmentId) {
    return `${SKILL_REVIEW_ID_PREFIX}${assessmentId}`;
  }

  static getAssessmentIdFromId(skillReviewId) {
    return parseInt(skillReviewId.replace(SKILL_REVIEW_ID_PREFIX, ''), 10);
  }
}

module.exports = SkillReview;
