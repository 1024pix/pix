const _ = require('lodash');
class Skill {
  constructor({
    // attributes
    name
    // includes
    // references
  } = {}) {
    // attributes
    this.name = name;
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

  computePixScore(competenceSkills) {
    const numberOfSkillsByDifficulty= _.filter(competenceSkills, (skill) => skill.difficulty === this.difficulty).length;

    return Math.min(4, 8 / numberOfSkillsByDifficulty);
  }

  static areEqual(oneSkill, otherSkill) {
    if (oneSkill == null || otherSkill == null) {
      return false;
    }

    return oneSkill.name === otherSkill.name;
  }
}

module.exports = Skill;
