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
  }
}

module.exports = TargetProfile;
