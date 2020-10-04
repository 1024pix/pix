class TargetedSkill {
  constructor({
    id,
    name,
    tubeId,
  } = {}) {
    this.id = id;
    this.name = name;
    this.tubeId = tubeId;
  }

  get difficulty() {
    return parseInt(this.name.slice(-1));
  }
}

module.exports = TargetedSkill;
