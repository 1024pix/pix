const _ = require('lodash');

class Skill {
  constructor({
    id,
    // attributes
    name,
    pixValue,
    // includes
    // references
    competenceId,
    tutorialIds = [],
    tubeId,
  } = {}) {
    this.id = id;
    // attributes
    this.name = name;
    this.pixValue = pixValue;
    // includes
    // references
    this.competenceId = competenceId;
    this.tutorialIds = tutorialIds;
    this.tubeId = tubeId;
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

  static sortByDecreasingDifficulty(skills) {
    return _(skills)
      .sortBy('difficulty')
      .reverse()
      .value();
  }
}

module.exports = Skill;
