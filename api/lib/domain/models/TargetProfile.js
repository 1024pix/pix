class TargetProfile {
  constructor({
    id,
    // attributes
    name,
    imageUrl,
    isPublic,
    outdated,
    // includes
    skills = [],
    stages,
    // references
    organizationId,
  } = {}) {
    this.id = id;
    // attributes
    this.name = name;
    this.imageUrl = imageUrl;
    this.isPublic = isPublic;
    this.outdated = outdated;
    // includes
    this.skills = skills;
    this.stages = stages;
    // references
    this.organizationId = organizationId;
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

  getSkillNames() {
    return this.skills.map((skill) => skill.name);
  }

  getSkillIds() {
    return this.skills.map((skill) => skill.id);
  }
}

module.exports = TargetProfile;
