const _ = require('lodash');

class Tube {

  constructor({
    // attributes
    id,
    name,
    title,
    description,
    practicalTitle,
    practicalDescription,
    // includes
    skills = [],
    // references
    competenceId,
  } = {}) {
    // attributes
    this.id = id;
    this.title = title;
    this.description = description;
    this.practicalTitle = practicalTitle;
    this.practicalDescription = practicalDescription;
    // includes
    this.skills = skills;
    // references
    this.competenceId = competenceId;

    if (name) {
      this.name = name;
    } else if (skills.length > 0) {
      this.name = skills[0].tubeName;
    } else {
      this.name = '';
    }
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
