class TargetProfile {
  constructor({
    // attributes
    name,
    isPublic,
    // includes
    skills = [],
    // references
    organizationId
  } = {}) {
    // attributes
    this.name = name;
    this.isPublic = isPublic;
    // includes
    this.skills = skills;
    // references
    this.organizationId = organizationId;
  }
}

module.exports = TargetProfile;
