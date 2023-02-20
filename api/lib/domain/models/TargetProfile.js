const categories = {
  OTHER: 'OTHER',
  COMPETENCES: 'COMPETENCES',
  SUBJECT: 'SUBJECT',
  DISCIPLINE: 'DISCIPLINE',
  CUSTOM: 'CUSTOM',
  PREDEFINED: 'PREDEFINED',
};

class TargetProfile {
  constructor({
    id,
    name,
    imageUrl,
    isPublic,
    isSimplifiedAccess,
    outdated,
    skills = [],
    stages,
    badges,
    ownerOrganizationId,
    description,
  } = {}) {
    this.id = id;
    this.name = name;
    this.imageUrl = imageUrl;
    this.isPublic = isPublic;
    this.isSimplifiedAccess = isSimplifiedAccess;
    this.outdated = outdated;
    this.skills = skills;
    this.stages = stages;
    this.badges = badges;
    this.ownerOrganizationId = ownerOrganizationId;
    this.description = description;
    this.organizationsAttached = [];
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

  get organizations() {
    return this.organizationsAttached;
  }
}

TargetProfile.categories = categories;

export default TargetProfile;
