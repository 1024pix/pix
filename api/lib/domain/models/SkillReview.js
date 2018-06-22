/*
 * Traduction : Profil d'avancement
 */
class SkillReview {

  constructor({ assessment, targetProfile } = {}) {
    this.id = assessment.id;
    this.assessment = assessment;
    this.targetProfile = targetProfile;
  }

  get profileMastery() {
    const numberOfTargetedSkills = this.targetProfile.skills.length;
    const numberOfValidatedSkills = this.assessment.getValidatedSkills().length;
    const targetProfileHasSkills = numberOfTargetedSkills !== 0;

    return targetProfileHasSkills ? (numberOfValidatedSkills / numberOfTargetedSkills) : 0;
  }

}

module.exports = SkillReview;
