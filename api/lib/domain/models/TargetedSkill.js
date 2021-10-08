class TargetedSkill {
  constructor({ id, name, tubeId, tutorialIds } = {}) {
    this.id = id;
    this.name = name;
    this.tubeId = tubeId;
    this.tutorialIds = tutorialIds;
  }

  get difficulty() {
    return parseInt(this.name.slice(-1));
  }
}

module.exports = TargetedSkill;
