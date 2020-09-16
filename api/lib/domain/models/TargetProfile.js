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

  findSkillById(skillId) {
    return this.skills.find((skill) => skill.id === skillId);
  }
}

module.exports = TargetProfile;
