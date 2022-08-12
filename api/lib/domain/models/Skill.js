class Skill {
  constructor({
    id,
    name,
    pixValue,
    competenceId,
    tutorialIds = [],
    learningMoreTutorialIds = [],
    tubeId,
    version,
    level,
  } = {}) {
    this.id = id;
    this.name = name;
    this.pixValue = pixValue;
    this.competenceId = competenceId;
    this.tutorialIds = tutorialIds;
    this.learningMoreTutorialIds = learningMoreTutorialIds;
    this.tubeId = tubeId;
    this.version = version;
    this.level = level;
  }

  get difficulty() {
    return Number.parseInt(this.name.slice(-1));
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
}

module.exports = Skill;
