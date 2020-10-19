class TargetProfile {
  constructor({
    id,
    name,
    imageUrl,
    isPublic,
    outdated,
    skills = [],
    stages,
    badges,
    organizationId,
  } = {}) {
    this.id = id;
    this.name = name;
    this.imageUrl = imageUrl;
    this.isPublic = isPublic;
    this.outdated = outdated;
    this.skills = skills;
    this.stages = stages;
    this.badges = badges;
    this.organizationId = organizationId;
  }

  get hasBadges() {
    return !!this.badges && this.badges.length > 0;
  }

  hasSkill(skillId) {
    return this.skills.some((skill) => skill.id === skillId);
  }

  getCompetenceIds() {
    const competenceIdsOfSkills = this.skills.map((skill) => skill.competenceId);
    const uniqCompetenceIds = new Set(competenceIdsOfSkills);
    return Array.from(uniqCompetenceIds);
  }

  getTargetedCompetences(competences) {
    const targetedCompetenceIds = this.getCompetenceIds();
    return competences.filter((competence) => targetedCompetenceIds.includes(competence.id));
  }

  getSkillIds() {
    return this.skills.map((skill) => skill.id);
  }

  getSkillCountForCompetence(competenceId) {
    return this.skills.filter((skill) => skill.competenceId === competenceId).length;
  }
}

module.exports = TargetProfile;
