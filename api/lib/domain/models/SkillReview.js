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
    validatedSkills = [],
    failedSkills = [],
    unratableSkills = [],
  }) {
    this.id = id;
    // attributes
    // includes
    this.targetedSkills = targetedSkills;
    this.validatedSkills = validatedSkills;
    this.failedSkills = failedSkills;
    this.unratableSkills = unratableSkills;
  }

  get profileMasteryRate() {
    const numberOfTargetedSkills = this.targetedSkills.length;

    const validatedSkillsThatExistsInTargetedSkills = _.intersectionBy(this.targetedSkills, this.validatedSkills, 'name');
    const numberOfValidatedSkills = validatedSkillsThatExistsInTargetedSkills.length;

    const targetProfileHasSkills = numberOfTargetedSkills !== 0;

    return targetProfileHasSkills ? (numberOfValidatedSkills / numberOfTargetedSkills) : 0;
  }

  get profileCompletionRate() {
    const numberOfTargetedSkills = this.targetedSkills.length;
    const numberOfUnratableSkills = this.unratableSkills.length;

    const validatedSkillsThatExistsInTargetedSkills = _.intersectionBy(this.targetedSkills, this.validatedSkills, 'name');
    const numberOfValidatedSkills = validatedSkillsThatExistsInTargetedSkills.length;

    const failedSkillsThatExistsInTargetedSkills = _.intersectionBy(this.targetedSkills, this.failedSkills, 'name');
    const numberOfFailedSkills = failedSkillsThatExistsInTargetedSkills.length;

    const targetProfileHasSkills = numberOfTargetedSkills !== 0;
    return targetProfileHasSkills ? (numberOfFailedSkills + numberOfValidatedSkills + numberOfUnratableSkills) / numberOfTargetedSkills : 0;
  }

  static generateIdFromAssessmentId(assessmentId) {
    return `${SKILL_REVIEW_ID_PREFIX}${assessmentId}`;
  }

  static getAssessmentIdFromId(skillReviewId) {
    return parseInt(skillReviewId.replace(SKILL_REVIEW_ID_PREFIX, ''), 10);
  }
}

module.exports = SkillReview;
