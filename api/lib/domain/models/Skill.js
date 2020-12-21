const _ = require('lodash');

class Skill {
  constructor({
    id,
    name,
    pixValue,
    competenceId,
    tutorialIds = [],
    tubeId,
  } = {}) {
    this.id = id;
    this.name = name;
    this.pixValue = pixValue;
    this.competenceId = competenceId;
    this.tutorialIds = tutorialIds;
    this.tubeId = tubeId;
  }

  get difficulty() {
    return parseInt(this.name.slice(-1));
  }

  get tubeName() {
    return this.name.slice(0, -1); //with skill'@sourceImage2', returns '@sourceImage'
  }

  get tubeNameWithoutPrefix() {
    return this.tubeName.slice(1); //with skill '@sourceImage2', returns 'sourceImage'
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
