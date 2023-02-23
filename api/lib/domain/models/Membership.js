const { InvalidMembershipOrganizationRoleError } = require('../errors.js');
const roles = {
  ADMIN: 'ADMIN',
  MEMBER: 'MEMBER',
};

class Membership {
  constructor({ id, organizationRole = roles.MEMBER, updatedByUserId, organization, user } = {}) {
    this.id = id;
    this.organizationRole = organizationRole;
    this.updatedByUserId = updatedByUserId;
    this.organization = organization;
    this.user = user;
  }

  get isAdmin() {
    return this.organizationRole === roles.ADMIN;
  }

  validateRole() {
    const isRoleValid = Object.values(roles).includes(this.organizationRole);
    if (!isRoleValid) {
      throw new InvalidMembershipOrganizationRoleError();
    }
  }
}

Membership.roles = roles;

module.exports = Membership;
