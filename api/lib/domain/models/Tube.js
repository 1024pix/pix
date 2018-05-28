class Tube {

  constructor({ skills }) {
    this.skills = skills;
    this.name = skills[0].tubeName;
  }

  addSkill(skill) {
    if(!this.skills.find(skillTube => skillTube.name === skill.name)) {
      this.skills.push(skill);
    }
  }

  getEasierWithin(skill) {
    return this.skills.filter(tubeSkill => tubeSkill.difficulty <= skill.difficulty);
  }

  getHarderWithin(skill) {
    return this.skills.filter(tubeSkill => tubeSkill.difficulty >= skill.difficulty);
  }

}

module.exports = Tube;
