class Tube {

  constructor({ skills = [] }) {
    this.skills = skills;
    this.name = (skills.length > 0) ? skills[0].tubeName : '';
  }

  addSkill(skillToAdd) {
    if(!this.skills.find(skill => skill.name === skillToAdd.name)) {
      this.skills.push(skillToAdd);
    }
  }

  getEasierThan(skill) {
    return this.skills.filter(tubeSkill => tubeSkill.difficulty <= skill.difficulty);
  }

  getHarderThan(skill) {
    return this.skills.filter(tubeSkill => tubeSkill.difficulty >= skill.difficulty);
  }

}

module.exports = Tube;
