class OrganizationAccess {

  constructor({
    id,
    // attributes
    // includes
    user= {},
    organization = {},
    organizationRole = {}
    // references
  } = {}) {
    this.id = id;
    // attributes
    // includes
    this.user = user;
    this.organization = organization;
    this.organizationRole = organizationRole;
    // references
  }
}

module.exports = OrganizationAccess;
