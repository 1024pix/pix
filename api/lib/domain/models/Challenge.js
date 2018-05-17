class Challenge {

  constructor({ skills = [] } = {}) {
    this.skills = skills;
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
