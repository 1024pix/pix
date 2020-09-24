class TargetedTube {
  constructor({
    id,
    practicalTitle,
    competenceId,
    skills = [],
  } = {}) {
    this.id = id;
    this.practicalTitle = practicalTitle;
    this.competenceId = competenceId;
    this.skills = skills;
  }
}

module.exports = TargetedTube;
