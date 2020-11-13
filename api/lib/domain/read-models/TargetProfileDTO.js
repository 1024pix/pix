class TargetProfileDTO {

  constructor({ id, name, outdated, isPublic, organizationId, organizations }) {
    this.id = id;
    this.name = name;
    this.outdated = outdated;
    this.isPublic = isPublic;
    this.organizationId = organizationId;
    this.organizations = organizations;
  }
}

module.exports = TargetProfileDTO;
