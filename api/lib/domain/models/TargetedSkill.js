class TargetedSkill {
  constructor({ id, name, tubeId, tutorialIds, difficulty } = {}) {
    this.id = id;
    this.name = name;
    this.tubeId = tubeId;
    this.tutorialIds = tutorialIds;
    this.difficulty = difficulty;
  }
}

module.exports = TargetedSkill;
