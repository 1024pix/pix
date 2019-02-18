const _ = require('lodash');

class Skill {
  constructor({
    id,
    // attributes
    name,
    pixValue,
    // includes
    // references
  } = {}) {
    this.id = id;
    // attributes
    this.name = name;
    this.pixValue = pixValue;
    // includes
    // references
  }

  get difficulty() {
    return parseInt(this.name.slice(-1));
  }

  get tubeName() {
    return this.name.slice(1, -1);
  }

  get tubeNameWithAt() {
    return this.name.slice(0, -1);
  }

  computeMaxReachablePixScoreForSkill(competenceSkills) {
    const skillsOfThisDifficulty = _.filter(competenceSkills, (skill) => skill.difficulty === this.difficulty);
    const numberOfSkillsOfThisDifficulty = skillsOfThisDifficulty.length;

    return Math.min(4, 8 / numberOfSkillsOfThisDifficulty);
  }

  static areEqual(oneSkill, otherSkill) {
    if (oneSkill == null || otherSkill == null) {
      return false;
    }

    return oneSkill.name === otherSkill.name;
  }

  static areEqualById(oneSkill, otherSkill) {
    if (oneSkill == null || otherSkill == null) {
      return false;
    }

    return oneSkill.id === otherSkill.id;
  }
}

module.exports = Skill;
