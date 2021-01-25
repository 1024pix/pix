class TargetedTube {
  constructor({
    id,
    practicalTitle,
    description,
    competenceId,
    skills = [],
  } = {}) {
    this.id = id;
    this.practicalTitle = practicalTitle;
    this.description = description;
    this.competenceId = competenceId;
    this.skills = skills;
  }

  hasSkill(skillId) {
    return this.skills.some((skill) => skill.id === skillId);
  }
}

module.exports = TargetedTube;
