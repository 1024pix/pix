class TargetProfile {
  constructor({
    // attributes
    id,
    name,
    isPublic,
    // includes
    skills = [],
    // references
    organizationId
  } = {}) {
    // attributes
    this.id = id;
    this.name = name;
    this.isPublic = isPublic;
    // includes
    this.skills = skills;
    // references
    this.organizationId = organizationId;
  }
}

module.exports = TargetProfile;
