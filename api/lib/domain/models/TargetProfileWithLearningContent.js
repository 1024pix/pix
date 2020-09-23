class TargetProfileWithLearningContent {
  constructor({
    id,
    name,
    skills = [],
    tubes = [],
    competences = [],
    areas = [],
  } = {}) {
    this.id = id;
    this.name = name;
    this.skills = skills;
    this.tubes = tubes;
    this.competences = competences;
    this.areas = areas;
  }

  get skillNames() {
    return this.skills.map((skill) => skill.name).sort();
  }

  get competenceIds() {
    return this.competences.map((competences) => competences.id).sort();
  }

  hasSkill(skillId) {
    return this.skills.some((skill) => skill.id === skillId);
  }

  getCompetenceIdOfSkill(skillId) {
    const skillTube = this.tubes.find((tube) => tube.hasSkill(skillId));

    return skillTube ? skillTube.competenceId : null;
  }
}

module.exports = TargetProfileWithLearningContent;
