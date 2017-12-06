class Challenge {

  constructor(model = {}) {
    this.skills = model.skills || [];
  }

  addSkill(skill) {
    this.skills.push(skill);
  }

  hasSkill(searchedSkill) {
    return this.skills.filter((skill) => skill.name === searchedSkill.name).length > 0;
  }

  isPublished() {
    return ['validé', 'validé sans test', 'pré-validé'].includes(this.status);
  }

}

module.exports = Challenge;
