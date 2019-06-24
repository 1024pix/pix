const roles = {
  ADMIN: 1,
  MEMBER: 2,
};

class Membership {

  constructor({
    id,
    // attributes
    // includes
    organization,
    organizationRole,
    user,
    // references
  } = {}) {
    this.id = id;
    // attributes
    // includes
    this.organization = organization;
    this.organizationRole = organizationRole;
    this.user = user;
    // references
  }
}

Membership.roles = roles;

module.exports = Membership;
