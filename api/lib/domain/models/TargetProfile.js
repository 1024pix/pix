class TargetProfile {
  constructor({
    id,
    // attributes
    name,
    isPublic,
    // includes
    skills = [],
    // references
    organizationId
  } = {}) {
    this.id = id;
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
