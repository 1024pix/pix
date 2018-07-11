class OrganizationAccess {

  constructor({
    id,
    // attributes
    // includes
    organization = {},
    organizationRole = {}
    // references
  } = {}) {
    this.id = id;
    // attributes
    // includes
    this.organization = organization;
    this.organizationRole = organizationRole;
    // references
  }
}

module.exports = OrganizationAccess;
