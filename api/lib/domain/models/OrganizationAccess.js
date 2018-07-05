class OrganizationAccess {

  constructor({
    id,
    // attributes
    // embedded
    organization = {},
    organizationRole = {}
    // relations
  } = {}) {
    this.id = id;
    // attributes
    // embedded
    this.organization = organization;
    this.organizationRole = organizationRole;
    // relations
  }
}

module.exports = OrganizationAccess;
