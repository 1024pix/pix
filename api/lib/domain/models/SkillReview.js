/*
 * Traduction : Profil d'avancement
 */
class SkillReview {

  constructor({ id, tragetedSkills, validatedSkills, failedSkills } = {}) {
    this.id = id;
    this.tragetedSkills = tragetedSkills;
    this.validatedSkills = validatedSkills;
    this.failedSkills = failedSkills;
  }

  get profileMasteryRate() {
    const numberOfTargetedSkills = this.tragetedSkills.length;
    const numberOfValidatedSkills = this.validatedSkills.length;
    const targetProfileHasSkills = numberOfTargetedSkills !== 0;

    return targetProfileHasSkills ? (numberOfValidatedSkills / numberOfTargetedSkills) : 0;
  }
}

module.exports = SkillReview;
