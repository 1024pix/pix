class TargetProfile {
  constructor({
    id,
    // attributes
    name,
    isPublic,
    outdated,
    // includes
    skills = [],
    // references
    organizationId,
  } = {}) {
    this.id = id;
    // attributes
    this.name = name;
    this.isPublic = isPublic;
    this.outdated = outdated;
    // includes
    this.skills = skills;
    // references
    this.organizationId = organizationId;

    // caches for memoization
    this.skillsByCompetenceIdCache = {};
  }

  getSkillsForCompetence(competence) {
    if (competence.id in this.skillsByCompetenceIdCache) {
      return this.skillsByCompetenceIdCache[competence.id];
    }

    const allSkillIdsInCompetence = competence.skillIds;
    this.skillsByCompetenceIdCache[competence.id] = this.skills
      .filter((skill) => allSkillIdsInCompetence.includes(skill.id));

    return this.skillsByCompetenceIdCache[competence.id];
  }
}

module.exports = TargetProfile;
