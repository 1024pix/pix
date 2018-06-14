class SkillReview {

  constructor({ assessment, targetProfile } = {}) {
    this.assessment = assessment;
    this.targetProfile = targetProfile;
  }

  get progressionRate() {
    return 0;
  }

}

module.exports = SkillReview;
