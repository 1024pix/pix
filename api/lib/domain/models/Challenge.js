class Challenge {

  constructor(_ = {}) {
  }

  /**
   * @deprecated
   */
  static fromAttributes(attributes) {
    const challenge = new Challenge();
    Object.assign(challenge, attributes);
    if(!challenge.skills) {
      challenge.skills = [];
    }
    return challenge;
  }

  addSkill(skill) {
    this.skills.push(skill);
  }

  hasSkill(searchedSkill) {
    return this.skills.filter((skill) => skill.name === searchedSkill.name).length > 0;
  }

  // Same than isActive for algo
  isPublished() {
    return ['validé', 'validé sans test', 'pré-validé'].includes(this.status);
  }

  get hardestSkill() {
    return this.skills.reduce((s1, s2) => (s1.difficulty > s2.difficulty) ? s1 : s2);
  }

}

module.exports = Challenge;
