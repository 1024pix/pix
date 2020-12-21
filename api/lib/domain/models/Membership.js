const roles = {
  ADMIN: 'ADMIN',
  MEMBER: 'MEMBER',
};

class Membership {

  constructor({
    id,
    organizationRole = roles.MEMBER,
    updatedByUserId,
    organization,
    user,
  } = {}) {
    this.id = id;
    this.organizationRole = organizationRole;
    this.updatedByUserId = updatedByUserId;
    this.organization = organization;
    this.user = user;
  }

  get isAdmin() {
    return this.organizationRole === roles.ADMIN;
  }
}

Membership.roles = roles;

module.exports = Membership;
