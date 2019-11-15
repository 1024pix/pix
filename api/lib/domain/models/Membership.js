const roles = {
  ADMIN: 'ADMIN',
  MEMBER: 'MEMBER',
};

class Membership {

  constructor({
    id,
    // attributes
    organizationRole = roles.MEMBER,
    // includes
    organization,
    user,
    // references
  } = {}) {
    this.id = id;
    // attributes
    this.organizationRole = organizationRole;
    // includes
    this.organization = organization;
    this.user = user;
    // references
  }

  get isAdmin() {
    return this.organizationRole === roles.ADMIN;
  }
}

Membership.roles = roles;

module.exports = Membership;
