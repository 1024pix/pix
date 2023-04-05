class TrainingTriggerTube {
  constructor({ id, tube, level } = {}) {
    this.id = id;
    this.tube = tube;
    this.level = level;
  }

  getCappedSkills(skills) {
    return skills.filter((skill) => skill.difficulty <= this.level && skill.tubeId === this.tube.id);
  }
}

module.exports = TrainingTriggerTube;
