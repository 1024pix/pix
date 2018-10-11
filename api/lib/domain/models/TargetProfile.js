class TargetProfile {
  constructor({
    id,
    // attributes
    name,
    isPublic,
    // includes
    skills = [],
    // references
    organizationId,
    sharedWithOrganizationIds = [],
  } = {}) {
    this.id = id;
    // attributes
    this.name = name;
    this.isPublic = isPublic;
    // includes
    this.skills = skills;
    // references
    this.organizationId = organizationId;
    this.sharedWithOrganizationIds = sharedWithOrganizationIds;
  }
}

module.exports = TargetProfile;
