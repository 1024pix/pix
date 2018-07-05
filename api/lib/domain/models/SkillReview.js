const _ = require('lodash');
const SKILL_REVIEW_ID_PREFIX = 'skill-review-';

/*
 * Traduction : Profil d'avancement
 */
class SkillReview {

  constructor({
    id,
    // attributes
    // embedded
    targetedSkills = [],
    validatedSkills = [],
    failedSkills = [],
    // relations
  }) {
    this.id = id;
    // attributes
    // embedded
    this.targetedSkills = targetedSkills;
    this.validatedSkills = validatedSkills;
    this.failedSkills = failedSkills;
    // relations
  }

  get profileMasteryRate() {
    const numberOfTargetedSkills = this.targetedSkills.length;

    const validatedSkillsThatExistsInTargetedSkills = _.intersectionBy(this.targetedSkills, this.validatedSkills, 'name');
    const numberOfValidatedSkills = validatedSkillsThatExistsInTargetedSkills.length;

    const targetProfileHasSkills = numberOfTargetedSkills !== 0;

    return targetProfileHasSkills ? (numberOfValidatedSkills / numberOfTargetedSkills) : 0;
  }

  static generateIdFromAssessmentId(assessmentId) {
    return `${SKILL_REVIEW_ID_PREFIX}${assessmentId}`;
  }

  static getAssessmentIdFromId(skillReviewId) {
    return parseInt(skillReviewId.replace(SKILL_REVIEW_ID_PREFIX, ''), 10);
  }
}

module.exports = SkillReview;
