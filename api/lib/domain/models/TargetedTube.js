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

  hasSkill(skillId) {
    return this.skills.some((skill) => skill.id === skillId);
  }
}

module.exports = TargetedTube;
