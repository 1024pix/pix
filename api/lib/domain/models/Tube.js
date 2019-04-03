const _ = require('lodash');

class Tube {

  constructor({
    // attributes
    // includes
    skills = []
    // references
  } = {}) {
    // attributes
    // includes
    this.skills = skills;
    // references

    this.name = (skills.length > 0) ? skills[0].tubeName : '';
  }

  addSkill(skillToAdd) {
    if (!this.skills.find((skill) => skill.name === skillToAdd.name)) {
      this.skills.push(skillToAdd);
    }
  }

  getEasierThan(skill) {
    return this.skills.filter((tubeSkill) => tubeSkill.difficulty <= skill.difficulty);
  }

  getHarderThan(skill) {
    return this.skills.filter((tubeSkill) => tubeSkill.difficulty >= skill.difficulty);
  }

  getHardestSkill() {
    return _.maxBy(this.skills, 'difficulty');
  }

}

module.exports = Tube;
