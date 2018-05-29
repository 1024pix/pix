class OrganizationAccess {

  constructor({ id, organization = {}, organizationRole = {} } = {}) {
    this.id = id;
    this.organization = organization;
    this.organizationRole = organizationRole;

  }
}

module.exports = OrganizationAccess;
