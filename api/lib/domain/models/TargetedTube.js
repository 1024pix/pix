class TargetedTube {
  constructor({
    id,
    practicalTitle,
    practicalDescription,
    description,
    competenceId,
    skills = [],
    level,
    challenges = [],
  } = {}) {
    this.id = id;
    this.practicalTitle = practicalTitle;
    this.practicalDescription = practicalDescription;
    this.description = description;
    this.competenceId = competenceId;
    this.skills = skills;
    this.level = level;
    this.challenges = challenges;
  }

  hasSkill(skillId) {
    return this.skills.some((skill) => skill.id === skillId);
  }

  get mobile() {
    return this.challenges && this.challenges.length > 0 && this.challenges.every((c) => c.isMobileCompliant);
  }

  get tablet() {
    return this.challenges && this.challenges.length > 0 && this.challenges.every((c) => c.isTabletCompliant);
  }
}

module.exports = TargetedTube;
